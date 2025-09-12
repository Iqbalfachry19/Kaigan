use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
declare_id!("FhxmHdczQUm3unCvVN6EWpbv5s3ivf5jJZ5U6fyc1gwn");

#[program]
pub mod clob {
    use super::*;

    // Inisialisasi market
    pub fn initialize_market(
        ctx: Context<InitializeMarket>,
        market_id: u64,
        base_mint: Pubkey,
        quote_mint: Pubkey,
    ) -> Result<()> {
        let market = &mut ctx.accounts.market;
        let authority = &ctx.accounts.authority;

        market.market_id = market_id;
        market.authority = *authority.key;
        market.base_mint = base_mint;
        market.quote_mint = quote_mint;
        market.bump = ctx.bumps.market;

        msg!(
            "Market initialized: {} with base mint {} and quote mint {}",
            market_id,
            base_mint,
            quote_mint
        );
        Ok(())
    }

    // Place order
    pub fn place_order(
        ctx: Context<PlaceOrder>,
        order_id: u64,
        side: Side,
        price: u64,
        quantity: u64,
    ) -> Result<()> {
        let order = &mut ctx.accounts.order;
        let user = &ctx.accounts.user;
        let market = &ctx.accounts.market;

        require!(price > 0, CLOBError::InvalidPrice);
        require!(quantity > 0, CLOBError::InvalidQuantity);

        order.order_id = order_id;
        order.user = *user.key;
        order.market = market.key();
        order.side = side;
        order.price = price;
        order.quantity = quantity;
        order.filled_quantity = 0;
        order.timestamp = Clock::get()?.unix_timestamp as u64;
        order.status = OrderStatus::Active;
        order.bump = ctx.bumps.order;

        msg!(
            "Order placed: {} - {} @ {}",
            order_id,
            order.side.as_ref(),
            price
        );
        Ok(())
    }

    // Cancel order
    pub fn cancel_order(ctx: Context<CancelOrder>) -> Result<()> {
        let order = &mut ctx.accounts.order;
        let user = &ctx.accounts.user;

        require!(order.user == *user.key, CLOBError::Unauthorized);
        require!(
            order.status == OrderStatus::Active,
            CLOBError::OrderNotActive
        );

        order.status = OrderStatus::Cancelled;

        msg!("Order cancelled: {}", order.order_id);
        Ok(())
    }

    // Fill order (simplified matching)
    pub fn fill_order(ctx: Context<FillOrder>, fill_quantity: u64) -> Result<()> {
        let order = &mut ctx.accounts.order;
        let filler = &ctx.accounts.seller;

        require!(
            order.status == OrderStatus::Active,
            CLOBError::OrderNotActive
        );
        require!(
            fill_quantity <= order.quantity - order.filled_quantity,
            CLOBError::InvalidFillQuantity
        );

        // Execute token transfers between parties
        match order.side {
            Side::Buy => {
                // Buyer wants base tokens, seller provides base tokens
                // Transfer base tokens from seller to buyer
                token::transfer(
                    CpiContext::new(
                        ctx.accounts.token_program.to_account_info(),
                        Transfer {
                            from: ctx.accounts.seller_base_token.to_account_info(),
                            to: ctx.accounts.buyer_base_token.to_account_info(),
                            authority: filler.to_account_info(),
                        },
                    ),
                    fill_quantity,
                )?;

                // Transfer quote tokens from buyer to seller
                let payment_amount = order.price * fill_quantity;
                token::transfer(
                    CpiContext::new(
                        ctx.accounts.token_program.to_account_info(),
                        Transfer {
                            from: ctx.accounts.buyer_quote_token.to_account_info(),
                            to: ctx.accounts.seller_quote_token.to_account_info(),
                            authority: ctx.accounts.buyer.to_account_info(),
                        },
                    ),
                    payment_amount,
                )?;
            }
            Side::Sell => {
                // Seller wants quote tokens, buyer provides quote tokens
                // Transfer quote tokens from buyer to seller
                let payment_amount = order.price * fill_quantity;
                token::transfer(
                    CpiContext::new(
                        ctx.accounts.token_program.to_account_info(),
                        Transfer {
                            from: ctx.accounts.buyer_quote_token.to_account_info(),
                            to: ctx.accounts.seller_quote_token.to_account_info(),
                            authority: ctx.accounts.buyer.to_account_info(),
                        },
                    ),
                    payment_amount,
                )?;

                // Transfer base tokens from seller to buyer
                token::transfer(
                    CpiContext::new(
                        ctx.accounts.token_program.to_account_info(),
                        Transfer {
                            from: ctx.accounts.seller_base_token.to_account_info(),
                            to: ctx.accounts.buyer_base_token.to_account_info(),
                            authority: filler.to_account_info(),
                        },
                    ),
                    fill_quantity,
                )?;
            }
        }

        order.filled_quantity += fill_quantity;

        if order.filled_quantity >= order.quantity {
            order.status = OrderStatus::Filled;
        }

        msg!(
            "Order filled: {} - {} filled - Token transfers completed",
            order.order_id,
            fill_quantity
        );
        Ok(())
    }

    // Get orderbook state
    pub fn get_orderbook(ctx: Context<GetOrderbook>) -> Result<()> {
        let market = &ctx.accounts.market;

        msg!(
            "Market: {} - Base: {} Quote: {}",
            market.market_id,
            market.base_mint,
            market.quote_mint
        );
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(market_id: u64)]
pub struct InitializeMarket<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + Market::LEN,
        seeds = [b"market", market_id.to_le_bytes().as_ref()],
        bump
    )]
    pub market: Account<'info, Market>,

    pub base_mint: Account<'info, token::Mint>,
    pub quote_mint: Account<'info, token::Mint>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(order_id: u64)]
pub struct PlaceOrder<'info> {
    #[account(
        init,
        payer = user,
        space = 8 + Order::LEN,
        seeds = [b"order", order_id.to_le_bytes().as_ref()],
        bump
    )]
    pub order: Account<'info, Order>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub market: Account<'info, Market>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CancelOrder<'info> {
    #[account(
        mut,
        constraint = order.status == OrderStatus::Active,
    )]
    pub order: Account<'info, Order>,

    #[account(mut)]
    pub user: Signer<'info>,
}

#[derive(Accounts)]
pub struct FillOrder<'info> {
    #[account(
        mut,
        constraint = order.status == OrderStatus::Active,
    )]
    pub order: Account<'info, Order>,

    pub buyer: Signer<'info>,
    pub seller: Signer<'info>,

    #[account(mut)]
    pub buyer_base_token: Account<'info, TokenAccount>,

    #[account(mut)]
    pub buyer_quote_token: Account<'info, TokenAccount>,

    #[account(mut)]
    pub seller_base_token: Account<'info, TokenAccount>,

    #[account(mut)]
    pub seller_quote_token: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct GetOrderbook<'info> {
    pub market: Account<'info, Market>,
}

// Data Structures
#[account]
pub struct Market {
    pub market_id: u64,
    pub authority: Pubkey,
    pub base_mint: Pubkey,
    pub quote_mint: Pubkey,
    pub bump: u8,
}

impl Market {
    pub const LEN: usize = 8 + 32 + 32 + 32 + 1;
}

#[account]
pub struct Order {
    pub order_id: u64,
    pub user: Pubkey,
    pub market: Pubkey,
    pub side: Side,
    pub price: u64,
    pub quantity: u64,
    pub filled_quantity: u64,
    pub timestamp: u64,
    pub status: OrderStatus,
    pub bump: u8,
}

impl Order {
    pub const LEN: usize = 8 + 32 + 32 + 1 + 8 + 8 + 8 + 8 + 1 + 1;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum Side {
    Buy,
    Sell,
}

impl AsRef<str> for Side {
    fn as_ref(&self) -> &str {
        match self {
            Side::Buy => "Buy",
            Side::Sell => "Sell",
        }
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum OrderStatus {
    Active,
    Filled,
    Cancelled,
}

#[error_code]
pub enum CLOBError {
    #[msg("Invalid price")]
    InvalidPrice,
    #[msg("Invalid quantity")]
    InvalidQuantity,
    #[msg("Order not active")]
    OrderNotActive,
    #[msg("Invalid fill quantity")]
    InvalidFillQuantity,
    #[msg("Unauthorized")]
    Unauthorized,
    #[msg("Insufficient funds")]
    InsufficientFunds,
}
