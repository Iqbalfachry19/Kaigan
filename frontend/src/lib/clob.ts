export type Clob = {
  "version": "0.1.0",
  "name": "clob",
  "instructions": [
    {
      "name": "cancelOrder",
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
      "name": "fillOrder",
      "accounts": [
        {
          "name": "order",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "filler",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "fillQuantity",
          "type": "u64"
        }
      ]
    },
    {
      "name": "getOrderbook",
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
      "name": "initializeMarket",
      "accounts": [
        {
          "name": "market",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "marketId",
          "type": "u64"
        },
        {
          "name": "baseMint",
          "type": "publicKey"
        },
        {
          "name": "quoteMint",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "placeOrder",
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
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "orderId",
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
      "name": "market",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "marketId",
            "type": "u64"
          },
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "baseMint",
            "type": "publicKey"
          },
          {
            "name": "quoteMint",
            "type": "publicKey"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "order",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "orderId",
            "type": "u64"
          },
          {
            "name": "user",
            "type": "publicKey"
          },
          {
            "name": "market",
            "type": "publicKey"
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
            "name": "filledQuantity",
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
    }
  ]
};

export const IDL: Clob = {
  "version": "0.1.0",
  "name": "clob",
  "instructions": [
    {
      "name": "cancelOrder",
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
      "name": "fillOrder",
      "accounts": [
        {
          "name": "order",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "filler",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "fillQuantity",
          "type": "u64"
        }
      ]
    },
    {
      "name": "getOrderbook",
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
      "name": "initializeMarket",
      "accounts": [
        {
          "name": "market",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "marketId",
          "type": "u64"
        },
        {
          "name": "baseMint",
          "type": "publicKey"
        },
        {
          "name": "quoteMint",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "placeOrder",
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
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "orderId",
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
      "name": "market",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "marketId",
            "type": "u64"
          },
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "baseMint",
            "type": "publicKey"
          },
          {
            "name": "quoteMint",
            "type": "publicKey"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "order",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "orderId",
            "type": "u64"
          },
          {
            "name": "user",
            "type": "publicKey"
          },
          {
            "name": "market",
            "type": "publicKey"
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
            "name": "filledQuantity",
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
    }
  ]
};


