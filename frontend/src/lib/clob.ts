export type Clob = {
  "version": "0.1.0",
  "name": "clob",
  "instructions": [
    {
      "name": "cancel_order",
      "accounts": [
        {
          "name": "order",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": []
    },
    {
      "name": "fill_order",
      "accounts": [
        {
          "name": "order",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "buyer",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "seller",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "buyer_base_token",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "buyer_quote_token",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "seller_base_token",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "seller_quote_token",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "token_program",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "fill_quantity",
          "type": "u64"
        }
      ]
    },
    {
      "name": "get_orderbook",
      "accounts": [
        {
          "name": "market",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "initialize_market",
      "accounts": [
        {
          "name": "market",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "base_mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "quote_mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "system_program",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "market_id",
          "type": "u64"
        },
        {
          "name": "base_mint",
          "type": "pubkey"
        },
        {
          "name": "quote_mint",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "place_order",
      "accounts": [
        {
          "name": "order",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "market",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "token_program",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "system_program",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "order_id",
          "type": "u64"
        },
        {
          "name": "side",
          "type": {
            "defined": "Side"
          }
        },
        {
          "name": "price",
          "type": "u64"
        },
        {
          "name": "quantity",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "Market",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "market_id",
            "type": "u64"
          },
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "base_mint",
            "type": "pubkey"
          },
          {
            "name": "quote_mint",
            "type": "pubkey"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "Order",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "order_id",
            "type": "u64"
          },
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "market",
            "type": "pubkey"
          },
          {
            "name": "side",
            "type": {
              "defined": "Side"
            }
          },
          {
            "name": "price",
            "type": "u64"
          },
          {
            "name": "quantity",
            "type": "u64"
          },
          {
            "name": "filled_quantity",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "u64"
          },
          {
            "name": "status",
            "type": {
              "defined": "OrderStatus"
            }
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "OrderStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Active"
          },
          {
            "name": "Filled"
          },
          {
            "name": "Cancelled"
          }
        ]
      }
    },
    {
      "name": "Side",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Buy"
          },
          {
            "name": "Sell"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidPrice",
      "msg": "Invalid price"
    },
    {
      "code": 6001,
      "name": "InvalidQuantity",
      "msg": "Invalid quantity"
    },
    {
      "code": 6002,
      "name": "OrderNotActive",
      "msg": "Order not active"
    },
    {
      "code": 6003,
      "name": "InvalidFillQuantity",
      "msg": "Invalid fill quantity"
    },
    {
      "code": 6004,
      "name": "Unauthorized",
      "msg": "Unauthorized"
    },
    {
      "code": 6005,
      "name": "InsufficientFunds",
      "msg": "Insufficient funds"
    }
  ]
};

export const IDL: Clob = {
  "version": "0.1.0",
  "name": "clob",
  "instructions": [
    {
      "name": "cancel_order",
      "accounts": [
        {
          "name": "order",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": []
    },
    {
      "name": "fill_order",
      "accounts": [
        {
          "name": "order",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "buyer",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "seller",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "buyer_base_token",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "buyer_quote_token",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "seller_base_token",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "seller_quote_token",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "token_program",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "fill_quantity",
          "type": "u64"
        }
      ]
    },
    {
      "name": "get_orderbook",
      "accounts": [
        {
          "name": "market",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "initialize_market",
      "accounts": [
        {
          "name": "market",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "base_mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "quote_mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "system_program",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "market_id",
          "type": "u64"
        },
        {
          "name": "base_mint",
          "type": "pubkey"
        },
        {
          "name": "quote_mint",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "place_order",
      "accounts": [
        {
          "name": "order",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "market",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "token_program",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "system_program",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "order_id",
          "type": "u64"
        },
        {
          "name": "side",
          "type": {
            "defined": "Side"
          }
        },
        {
          "name": "price",
          "type": "u64"
        },
        {
          "name": "quantity",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "Market",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "market_id",
            "type": "u64"
          },
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "base_mint",
            "type": "pubkey"
          },
          {
            "name": "quote_mint",
            "type": "pubkey"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "Order",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "order_id",
            "type": "u64"
          },
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "market",
            "type": "pubkey"
          },
          {
            "name": "side",
            "type": {
              "defined": "Side"
            }
          },
          {
            "name": "price",
            "type": "u64"
          },
          {
            "name": "quantity",
            "type": "u64"
          },
          {
            "name": "filled_quantity",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "u64"
          },
          {
            "name": "status",
            "type": {
              "defined": "OrderStatus"
            }
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "OrderStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Active"
          },
          {
            "name": "Filled"
          },
          {
            "name": "Cancelled"
          }
        ]
      }
    },
    {
      "name": "Side",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Buy"
          },
          {
            "name": "Sell"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidPrice",
      "msg": "Invalid price"
    },
    {
      "code": 6001,
      "name": "InvalidQuantity",
      "msg": "Invalid quantity"
    },
    {
      "code": 6002,
      "name": "OrderNotActive",
      "msg": "Order not active"
    },
    {
      "code": 6003,
      "name": "InvalidFillQuantity",
      "msg": "Invalid fill quantity"
    },
    {
      "code": 6004,
      "name": "Unauthorized",
      "msg": "Unauthorized"
    },
    {
      "code": 6005,
      "name": "InsufficientFunds",
      "msg": "Insufficient funds"
    }
  ]
};