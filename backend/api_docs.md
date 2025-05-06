# Teacher Card Game API Documentation
This document provides details about the Teacher Card Game API endpoints, request formats, and response structures.

## Table of Contents

- [Base URL](#base-url)
- [Authentication](#authentication)
- [Error Handling](#error-handling)
- [Authentication Endpoints](#authentication-endpoints)
  - [Register](#register)
  - [Login](#login)
  - [Get Profile](#get-profile)
- [Card Endpoints](#card-endpoints)
  - [Get User Cards](#get-user-cards)
  - [Get Card by ID](#get-card-by-id)
  - [Open Pack](#open-pack)
  - [Claim Daily Pack](#claim-daily-pack)
  - [Upgrade Card](#upgrade-card)
  - [Sell Card](#sell-card)
- [Battle Endpoints](#battle-endpoints)
  - [Get Battle Cards](#get-battle-cards)
  - [Vote on Battle](#vote-on-battle)
  - [Get Battle History](#get-battle-history)
  - [Get Top Ranked Cards](#get-top-ranked-cards)
- [Season Endpoints](#season-endpoints)
  - [Get All Seasons](#get-all-seasons)
  - [Get Current Season](#get-current-season)
  - [Get Season Leaderboard](#get-season-leaderboard)
- [Trainer Endpoints](#trainer-endpoints)
  - [Get Top Trainers](#get-top-trainers)
- [Trade Endpoints](#trade-endpoints)
  - [Create Trade Offer](#create-trade-offer)
  - [Accept Trade Offer](#accept-trade-offer)
  - [Cancel Trade Offer](#cancel-trade-offer)
  - [Get Trade Offers](#get-trade-offers)
  - [Get User Trade History](#get-user-trade-history)
- [Admin Endpoints](#admin-endpoints)
  - [Teacher Management](#teacher-management)
    - [Create Teacher](#create-teacher)
    - [Get All Teachers](#get-all-teachers)
    - [Get Teacher by ID](#get-teacher-by-id)
    - [Update Teacher](#update-teacher)
    - [Delete Teacher](#delete-teacher)
  - [Quote Management](#quote-management)
    - [Add Quote to Teacher](#add-quote-to-teacher)
    - [Get All Quotes](#get-all-quotes)
    - [Get Quote by ID](#get-quote-by-id)
    - [Update Quote](#update-quote)
    - [Delete Quote](#delete-quote)
  - [Subject Management](#subject-management)
    - [Create Subject](#create-subject)
    - [Get All Subjects](#get-all-subjects)
    - [Get Subject by ID](#get-subject-by-id)
    - [Update Subject](#update-subject)
    - [Delete Subject](#delete-subject)
  - [Teacher-Subject Relationship](#teacher-subject-relationship)
    - [Add Subject to Teacher](#add-subject-to-teacher)
    - [Remove Subject from Teacher](#remove-subject-from-teacher)
  - [Season Management](#season-management)
    - [Create Season](#create-season)
    - [Update Season](#update-season)
    - [Delete Season](#delete-season)
  - [Card Generation](#card-generation)
    - [Generate Cards for Season](#generate-cards-for-season)
    - [Get Cards by Season ID](#get-cards-by-season-id)
    - [Delete Card](#delete-card)

## Base URL

All endpoints are relative to the base URL:

```
http://localhost:3000/api
```

## Authentication

Most endpoints require authentication via JWT token. Include the token in the `Authorization` header as follows:

```
Authorization: Bearer <your_token_here>
```

## Error Handling

The API uses standard HTTP status codes to indicate the success or failure of requests:

- `200`: Success
- `201`: Created
- `400`: Bad Request (invalid input, missing required fields)
- `401`: Unauthorized (invalid or missing token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `500`: Internal Server Error

Error responses have a consistent format:

```json
{
  "message": "Error message description"
}
```

## Authentication Endpoints

### Register

Creates a new user account.

- **URL**: `/auth/register`
- **Method**: `POST`
- **Authentication**: None
- **Request Body**:
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- **Success Response (201)**:
  ```json
  {
    "message": "User registered successfully",
    "token": "jwt_token_string",
    "user": {
      "id": "uuid",
      "username": "string",
      "coins": 0,
      "rating": 0
    }
  }
  ```
- **Error Responses**:
  - `400`: Username already exists
  - `500`: Server error

### Login

Authenticates a user and provides a JWT token.

- **URL**: `/auth/login`
- **Method**: `POST`
- **Authentication**: None
- **Request Body**:
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- **Success Response (200)**:
  ```json
  {
    "message": "Login successful",
    "token": "jwt_token_string",
    "user": {
      "id": "uuid",
      "username": "string",
      "coins": 0,
      "rating": 0
    }
  }
  ```
- **Error Responses**:
  - `400`: Invalid credentials
  - `500`: Server error

### Get Profile

Retrieves the authenticated user's profile and card collection.

- **URL**: `/auth/profile`
- **Method**: `GET`
- **Authentication**: Required
- **Success Response (200)**:
  ```json
  {
    "user": {
      "id": "uuid",
      "username": "string",
      "coins": 0,
      "rating": 0,
      "cards": [
        {
          "id": "uuid",
          "type": "string",
          "level": 1
        }
      ],
      "packs": [
        {
        "id": "uuid",
        "season": "string",
        "opened": "bool"
        }
      ]
      "lastPackClaim": "ISO date string"
    }
  }
  ```
- **Error Responses**:
  - `401`: Authentication required
  - `404`: User not found
  - `500`: Server error

## Card Endpoints

### Get User Cards

Retrieves all cards owned by the authenticated user.

- **URL**: `/cards`
- **Method**: `GET`
- **Authentication**: Required
- **Success Response (200)**:
  ```json
  {
    "cards": [
      {
        "id": "uuid",
        "type": "string",
        "level": 1,
        "season": {
          "id": 1,
          "name": "string",
          "startDate": "ISO date string",
          "endDate": "ISO date string",
          "isActive": true
        }
      }
    ]
  }
  ```
- **Error Responses**:
  - `401`: Authentication required
  - `500`: Server error

### Get Card by Type

Retrieves details about a specific card type.

- URL: `/cards/type/:type`
- Method: `GET`
- Authentication: None
- URL Parameters:
  - `type`: Card Type
- **Success Response (200)**:
```json
  {
    "card": {
        "type": "string",
        "teacherName": "string",
        "subject": "string",
        "quote": "string",
        "rating": 1000,
        "level": 1,
        "wins": 0,
        "losses": 0
    }
  }
```

- **Error Responses**:
  - `404`: Card not found
  - `500`: Server error

### Get Card by ID

Retrieves details about a specific card.

- **URL**: `/cards/:id`
- **Method**: `GET`
- **Authentication**: None
- **URL Parameters**:
  - `id`: Card ID
- **Success Response (200)**:
  ```json
  {
    "card": {
      "id": "uuid",
      "type": "string",
      "level": 1,
      "season": {
        "id": 1,
        "name": "string",
        "startDate": "ISO date string",
        "endDate": "ISO date string",
        "isActive": true
      },
      "owner": {
        "id": "uuid",
        "username": "string"
      }
    }
  }
  ```
- **Error Responses**:
  - `404`: Card not found
  - `500`: Server error

### Open Pack

Opens a pack to get new cards.

- **URL**: `/cards/open-pack`
- **Method**: `POST`
- **Authentication**: Required
- **Success Response (200)**:
  ```json
  {
    "message": "Pack opened successfully",
    "cards": [
      {
        "type": "uuid",
        "teacherName": "string",
        "subject": "string",
        "quote": "string",
        "rating": 1000,
        "level": 1,
        "wins": 0,
        "losses": 0
      }
    ]
  }
  ```
- **Error Responses**:
  - `401`: Authentication required
  - `404`: No unopened packs available / Season not found / No cards found in database
  - `500`: Server error

### Claim Daily Pack

Claims the daily free pack.

- **URL**: `/cards/claim-daily`
- **Method**: `POST`
- **Authentication**: Required
- **Success Response (200)**:
  ```json
  {
    "message": "Daily pack claimed successfully",
    "pack": {
      "id": "uuid",
      "seasonId": 1,
      "owner": {
        "id": "uuid",
        "username": "string"
      },
      "isOpened": false,
      "createdAt": "ISO date string"
    }
  }
  ```
- **Error Responses**:
  - `400`: Daily pack already claimed
  - `401`: Authentication required
  - `404`: User not found / No active season found
  - `500`: Server error

### Upgrade Card

Upgrades a card by sacrificing other cards of the same type.

- **URL**: `/cards/upgrade`
- **Method**: `POST`
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "cardId": "uuid",
    "sacrificeCardIds": ["uuid", "uuid"]
  }
  ```
- **Success Response (200)**:
  ```json
  {
    "message": "Card upgraded successfully",
    "card": {
      "id": "uuid",
      "type": "string",
      "level": 2,
      "owner": {
        "id": "uuid",
        "username": "string"
      }
    }
  }
  ```
- **Error Responses**:
  - `400`: No sacrifice cards provided / One or more sacrifice cards not found or not owned by user / Cannot sacrifice the card being upgraded / All sacrifice cards must have the same teacher and subject as the card being upgraded
  - `401`: Authentication required
  - `404`: Card not found or not owned by user
  - `500`: Server error

### Sell Card

Sells a card for coins.

- **URL**: `/cards/sell`
- **Method**: `POST`
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "cardId": "uuid"
  }
  ```
- **Success Response (200)**:
  ```json
  {
    "message": "Card sold successfully",
    "coinsEarned": 50,
    "totalCoins": 150
  }
  ```
- **Error Responses**:
  - `401`: Authentication required / User not authenticated
  - `404`: Card not found or not owned by user / User not found
  - `500`: Server error

## Battle Endpoints

### Get Battle Cards

Retrieves two random cards for a battle.

- **URL**: `/battles/cards`
- **Method**: `GET`
- **Authentication**: Required
- **Success Response (200)**:
  ```json
  {
    "card1": {
      "type": "uuid",
      "teacherName": "string",
      "subject": "string",
      "quote": "string",
      "rating": 1000,
      "level": 1,
      "wins": 0,
      "losses": 0
    },
    "card2": {
      "type": "uuid",
      "teacherName": "string",
      "subject": "string",
      "quote": "string",
      "rating": 1000,
      "level": 1,
      "wins": 0,
      "losses": 0
    }
  }
  ```
- **Error Responses**:
  - `401`: Authentication required
  - `404`: Not enough cards for a battle
  - `500`: Server error

### Vote on Battle

Votes for a winner in a battle between two cards.

- **URL**: `/battles/vote`
- **Method**: `POST`
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "card1Id": "uuid",
    "card2Id": "uuid",
    "winnerId": "uuid"
  }
  ```
- **Success Response (200)**:
  ```json
  {
    "message": "Vote recorded successfully",
    "battleResult": {
      "battle": {
        "id": "uuid",
        "card1": {
          "id": "uuid",
          "type": "string",
          "level": 1
        },
        "card2": {
          "id": "uuid",
          "type": "string",
          "level": 1
        },
        "winnerId": "uuid",
        "voter": {
          "id": "uuid",
          "username": "string"
        },
        "battleDate": "ISO date string"
      },
      "winnerNewRating": 1016,
      "loserNewRating": 984,
      "coinsEarned": 10
    }
  }
  ```
- **Error Responses**:
  - `400`: Missing required fields / Winner must be one of the battle cards
  - `401`: Authentication required
  - `404`: One or both cards not found
  - `500`: Server error

### Get Battle History

Retrieves the history of recent battles.

- **URL**: `/battles/history`
- **Method**: `GET`
- **Authentication**: Required
- **Success Response (200)**:
  ```json
  {
    "battles": [
      {
        "id": "uuid",
        "card1": {
          "id": "uuid",
          "type": "string",
          "level": 1
        },
        "card2": {
          "id": "uuid",
          "type": "string",
          "level": 1
        },
        "winnerId": "uuid",
        "voter": {
          "id": "uuid",
          "username": "string"
        },
        "battleDate": "ISO date string"
      }
    ]
  }
  ```
- **Error Responses**:
  - `401`: Authentication required
  - `500`: Server error

### Get Top Ranked Cards

Retrieves the highest-rated cards.

- **URL**: `/battles/top-cards`
- **Method**: `GET`
- **Authentication**: None
- **Query Parameters**:
  - `limit`: Number of cards to return (default: 10)
  - `seasonId`: Filter by season ID (optional)
- **Success Response (200)**:
  ```json
  {
    "cards": [
      {
        "type": "uuid",
        "teacherName": "string",
        "subject": "string",
        "quote": "string",
        "rating": 1200,
        "level": 1,
        "wins": 5,
        "losses": 2,
        "owner": {
          "id": "uuid",
          "username": "string"
        },
        "season": {
          "id": 1,
          "name": "string",
          "startDate": "ISO date string",
          "endDate": "ISO date string",
          "isActive": true
        }
      }
    ]
  }
  ```
- **Error Responses**:
  - `500`: Server error

## Season Endpoints

### Get All Seasons

Retrieves all seasons.

- **URL**: `/seasons`
- **Method**: `GET`
- **Authentication**: None
- **Success Response (200)**:
  ```json
  {
    "seasons": [
      {
        "id": 1,
        "name": "string",
        "startDate": "ISO date string",
        "endDate": "ISO date string",
        "isActive": true
      }
    ]
  }
  ```
- **Error Responses**:
  - `500`: Server error

### Get Current Season

Retrieves the currently active season.

- **URL**: `/seasons/current`
- **Method**: `GET`
- **Authentication**: None
- **Success Response (200)**:
  ```json
  {
    "season": {
      "id": 1,
      "name": "string",
      "startDate": "ISO date string",
      "endDate": "ISO date string",
      "isActive": true
    }
  }
  ```
- **Error Responses**:
  - `404`: No active season found
  - `500`: Server error

### Get Season Leaderboard

Retrieves the top-rated cards for a specific season.

- **URL**: `/seasons/:seasonId/leaderboard`
- **Method**: `GET`
- **Authentication**: None
- **URL Parameters**:
  - `seasonId`: Season ID
- **Success Response (200)**:
  ```json
  {
    "season": {
      "id": 1,
      "name": "string",
      "startDate": "ISO date string",
      "endDate": "ISO date string",
      "isActive": true
    },
    "leaderboard": [
      {
        "type": "uuid",
        "teacherName": "string",
        "subject": "string",
        "quote": "string",
        "rating": 1200,
        "level": 1,
        "wins": 5,
        "losses": 2,
        "owner": {
          "id": "uuid",
          "username": "string"
        }
      }
    ]
  }
  ```
- **Error Responses**:
  - `404`: Season not found
  - `500`: Server error

## Trainer Endpoints

### Get Top Trainers

Retrieves the highest-rated users (trainers).

- **URL**: `/trainers/top`
- **Method**: `GET`
- **Authentication**: None
- **Query Parameters**:
  - `limit`: Number of trainers to return (default: 100)
- **Success Response (200)**:
  ```json
  {
    "trainers": [
      {
        "id": "uuid",
        "username": "string",
        "rating": 1500
      }
    ]
  }
  ```
- **Error Responses**:
  - `500`: Server error

## Trade Endpoints

### Create Trade Offer

Creates a trade offer for cards or coins.

- **URL**: `/trades/create`
- **Method**: `POST`
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "offeredCardId": "uuid",
    "requestedCardId": "uuid", // Optional if askingPrice is provided
    "askingPrice": 100 // Optional if requestedCardId is provided
  }
  ```
- **Success Response (201)**:
  ```json
  {
    "message": "Trade offer created successfully",
    "trade": {
      "id": "uuid",
      "offeredBy": {
        "id": "uuid",
        "username": "string"
      },
      "offeredTo": {
        "id": "uuid",
        "username": "string"
      },
      "offeredCard": {
        "id": "uuid",
        "type": "string",
        "level": 1
      },
      "requestedCard": {
        "id": "uuid",
        "type": "string",
        "level": 1
      },
      "askingPrice": 0,
      "status": "pending",
      "createdAt": "ISO date string"
    }
  }
  ```
- **Error Responses**:
  - `400`: Missing required fields / One or both cards are already in a pending trade
  - `401`: Authentication required
  - `404`: Card not found or not owned by user / Requested card not found
  - `500`: Server error

### Accept Trade Offer

Accepts a trade offer.

- **URL**: `/trades/accept`
- **Method**: `POST`
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "tradeId": "uuid"
  }
  ```
- **Success Response (200)**:
  ```json
  {
    "message": "Trade completed successfully",
    "trade": {
      "id": "uuid",
      "offeredBy": {
        "id": "uuid",
        "username": "string"
      },
      "offeredTo": {
        "id": "uuid",
        "username": "string"
      },
      "offeredCard": {
        "id": "uuid",
        "type": "string",
        "level": 1
      },
      "requestedCard": {
        "id": "uuid",
        "type": "string",
        "level": 1
      },
      "askingPrice": 0,
      "status": "completed",
      "createdAt": "ISO date string"
    }
  }
  ```
- **Error Responses**:
  - `400`: Not enough coins to complete this trade
  - `401`: Authentication required / Not authenticated
  - `403`: Not authorized to accept this trade
  - `404`: Trade not found or already completed / Requested card no longer owned by user / User not found
  - `500`: Server error

### Cancel Trade Offer

Cancels a pending trade offer.

- **URL**: `/trades/cancel`
- **Method**: `POST`
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "tradeId": "uuid"
  }
  ```
- **Success Response (200)**:
  ```json
  {
    "message": "Trade canceled successfully",
    "trade": {
      "id": "uuid",
      "offeredBy": {
        "id": "uuid",
        "username": "string"
      },
      "status": "canceled"
    }
  }
  ```
- **Error Responses**:
  - `401`: Authentication required
  - `403`: Not authorized to cancel this trade
  - `404`: Trade not found or already completed
  - `500`: Server error

### Get Trade Offers

Retrieves pending trade offers for the authenticated user.

- **URL**: `/trades/offers`
- **Method**: `GET`
- **Authentication**: Required
- **Success Response (200)**:
  ```json
  {
    "trades": [
      {
        "id": "uuid",
        "offeredBy": {
          "id": "uuid",
          "username": "string"
        },
        "offeredTo": {
          "id": "uuid",
          "username": "string"
        },
        "offeredCard": {
          "id": "uuid",
          "type": "string",
          "level": 1
        },
        "requestedCard": {
          "id": "uuid",
          "type": "string",
          "level": 1
        },
        "askingPrice": 0,
        "status": "pending",
        "createdAt": "ISO date string"
      }
    ]
  }
  ```
- **Error Responses**:
  - `401`: Authentication required
  - `500`: Server error

### Get User Trade History

Retrieves the trade history for the authenticated user.

- **URL**: `/trades/history`
- **Method**: `GET`
- **Authentication**: Required
- **Success Response (200)**:
  ```json
  {
    "trades": [
      {
        "id": "uuid",
        "offeredBy": {
          "id": "uuid",
          "username": "string"
        },
        "offeredTo": {
          "id": "uuid",
          "username": "string"
        },
        "offeredCard": {
          "id": "uuid",
          "type": "string",
          "level": 1
        },
        "requestedCard": {
          "id": "uuid",
          "type": "string",
          "level": 1
        },
        "askingPrice": 0,
        "status": "completed",
        "createdAt": "ISO date string"
      }
    ]
  }
  ```
- **Error Responses**:
  - `401`: Authentication required
  - `500`: Server error

## Admin Endpoints

> **Note**: Admin endpoints require an admin password to be included in the request headers: `admin-password: alanleyel`

### Teacher Management

#### Create Teacher

Creates a new teacher.

- **URL**: `/admin/teachers`
- **Method**: `POST`
- **Authentication**: Admin password required
- **Request Body**:
  ```json
  {
    "name": "string",
    "subjectIds": ["uuid", "uuid"] // Optional
  }
  ```
- **Success Response (201)**:
  ```json
  {
    "message": "Teacher created successfully",
    "teacher": {
      "id": "uuid",
      "name": "string",
      "subjects": [
        {
          "id": "uuid",
          "name": "string"
        }
      ]
    }
  }
  ```
- **Error Responses**:
  - `400`: Teacher name is required
  - `401`: Unauthorized
  - `500`: Server error

#### Get All Teachers

Retrieves all teachers.

- **URL**: `/admin/teachers`
- **Method**: `GET`
- **Authentication**: Admin password required
- **Success Response (200)**:
  ```json
  {
    "teachers": [
      {
        "id": "uuid",
        "name": "string",
        "subjects": [
          {
            "id": "uuid",
            "name": "string"
          }
        ]
      }
    ]
  }
  ```
- **Error Responses**:
  - `401`: Unauthorized
  - `500`: Server error

#### Get Teacher by ID

Retrieves a teacher by ID.

- **URL**: `/admin/teachers/:id`
- **Method**: `GET`
- **Authentication**: Admin password required
- **URL Parameters**:
  - `id`: Teacher ID
- **Success Response (200)**:
  ```json
  {
    "teacher": {
      "id": "uuid",
      "name": "string",
      "subjects": [
        {
          "id": "uuid",
          "name": "string"
        }
      ],
      "quotes": [
        {
          "id": "uuid",
          "text": "string"
        }
      ]
    }
  }
  ```
- **Error Responses**:
  - `401`: Unauthorized
  - `404`: Teacher not found
  - `500`: Server error

#### Update Teacher

Updates an existing teacher.

- **URL**: `/admin/teachers/:id`
- **Method**: `PUT`
- **Authentication**: Admin password required
- **URL Parameters**:
  - `id`: Teacher ID
- **Request Body**:
  ```json
  {
    "name": "string"
  }
  ```
- **Success Response (200)**:
  ```json
  {
    "message": "Teacher updated successfully",
    "teacher": {
      "id": "uuid",
      "name": "string"
    }
  }
  ```
- **Error Responses**:
  - `400`: Name is required
  - `401`: Unauthorized
  - `404`: Teacher not found
  - `500`: Server error

#### Delete Teacher

Deletes a teacher.

- **URL**: `/admin/teachers/:id`
- **Method**: `DELETE`
- **Authentication**: Admin password required
- **URL Parameters**:
  - `id`: Teacher ID
- **Success Response (200)**:
  ```json
  {
    "message": "Teacher deleted successfully"
  }
  ```
- **Error Responses**:
  - `401`: Unauthorized
  - `404`: Teacher not found
  - `500`: Server error

### Quote Management

#### Add Quote to Teacher

Adds a quote to an existing teacher.

- **URL**: `/admin/teachers/:id/quotes`
- **Method**: `POST`
- **Authentication**: Admin password required
- **URL Parameters**:
  - `id`: Teacher ID
- **Request Body**:
  ```json
  {
    "text": "string"
  }
  ```
- **Success Response (201)**:
  ```json
  {
    "message": "Quote added successfully",
    "quote": {
      "id": "uuid",
      "text": "string",
      "teacher": {
        "id": "uuid",
        "name": "string"
      }
    }
  }
  ```
- **Error Responses**:
  - `400`: Quote text is required
  - `401`: Unauthorized
  - `404`: Teacher not found
  - `500`: Server error

#### Get All Quotes

Retrieves all quotes.

- **URL**: `/admin/quotes`
- **Method**: `GET`
- **Authentication**: Admin password required
- **Success Response (200)**:
  ```json
  {
    "quotes": [
      {
        "id": "uuid",
        "text": "string",
        "teacher": {
          "id": "uuid",
          "name": "string"
        }
      }
    ]
  }
  ```
- **Error Responses**:
  - `401`: Unauthorized
  - `500`: Server error

#### Get Quote by ID

Retrieves a quote by ID.

- **URL**: `/admin/quotes/:id`
- **Method**: `GET`
- **Authentication**: Admin password required
- **URL Parameters**:
  - `id`: Quote ID
- **Success Response (200)**:
  ```json
  {
    "quote": {
      "id": "uuid",
      "text": "string",
      "teacher": {
        "id": "uuid",
        "name": "string"
      }
    }
  }
  ```
- **Error Responses**:
  - `401`: Unauthorized
  - `404`: Quote not found
  - `500`: Server error

#### Update Quote

Updates an existing quote.

- **URL**: `/admin/quotes/:id`
- **Method**: `PUT`
- **Authentication**: Admin password required
- **URL Parameters**:
  - `id`: Quote ID
- **Request Body**:
  ```json
  {
    "text": "string"
  }
  ```
- **Success Response (200)**:
  ```json
  {
    "message": "Quote updated successfully",
    "quote": {
      "id": "uuid",
      "text": "string"
    }
  }
  ```
- **Error Responses**:
  - `400`: Text is required
  - `401`: Unauthorized
  - `404`: Quote not found
  - `500`: Server error

#### Delete Quote

Deletes a quote.

- **URL**: `/admin/quotes/:id`
- **Method**: `DELETE`
- **Authentication**: Admin password required
- **URL Parameters**:
  - `id`: Quote ID
- **Success Response (200)**:
  ```json
  {
    "message": "Quote deleted successfully"
  }
  ```
- **Error Responses**:
  - `401`: Unauthorized
  - `404`: Quote not found
  - `500`: Server error

### Subject Management

#### Create Subject

Creates a new subject.

- **URL**: `/admin/subjects`
- **Method**: `POST`
- **Authentication**: Admin password required
- **Request Body**:
  ```json
  {
    "name": "string"
  }
  ```
- **Success Response (201)**:
  ```json
  {
    "message": "Subject created successfully",
    "subject": {
      "id": "uuid",
      "name": "string"
    }
  }
  ```
- **Error Responses**:
  - `400`: Subject name is required
  - `401`: Unauthorized
  - `500`: Server error

#### Get All Subjects

Retrieves all subjects.

- **URL**: `/admin/subjects`
- **Method**: `GET`
- **Authentication**: Admin password required
- **Success Response (200)**:
  ```json
  {
    "subjects": [
      {
        "id": "uuid",
        "name": "string"
      }
    ]
  }
  ```
- **Error Responses**:
  - `401`: Unauthorized
  - `500`: Server error

#### Get Subject by ID

Retrieves details about a specific subject.

- **URL**: `/admin/subjects/:id`
- **Method**: `GET`
- **Authentication**: Admin password required
- **URL Parameters**:
  - `id`: Subject ID
- **Success Response (200)**:
  ```json
  {
    "subject": {
      "id": "uuid",
      "name": "string",
      "teachers": [
        {
          "id": "uuid",
          "name": "string"
        }
      ]
    }
  }
  ```
- **Error Responses**:
  - `401`: Unauthorized
  - `404`: Subject not found
  - `500`: Server error

#### Update Subject

Updates an existing subject.

- **URL**: `/admin/subjects/:id`
- **Method**: `PUT`
- **Authentication**: Admin password required
- **URL Parameters**:
  - `id`: Subject ID
- **Request Body**:
  ```json
  {
    "name": "string"
  }
  ```
- **Success Response (200)**:
  ```json
  {
    "message": "Subject updated successfully",
    "subject": {
      "id": "uuid",
      "name": "string"
    }
  }
  ```
- **Error Responses**:
  - `400`: Subject name is required
  - `401`: Unauthorized
  - `404`: Subject not found
  - `500`: Server error

#### Delete Subject

Deletes a subject.

- **URL**: `/admin/subjects/:id`
- **Method**: `DELETE`
- **Authentication**: Admin password required
- **URL Parameters**:
  - `id`: Subject ID
- **Success Response (200)**:
  ```json
  {
    "message": "Subject deleted successfully"
  }
  ```
- **Error Responses**:
  - `401`: Unauthorized
  - `404`: Subject not found
  - `500`: Server error

### Teacher-Subject Relationship

#### Add Subject to Teacher

Adds subjects to an existing teacher.

- **URL**: `/admin/teachers/:id/subjects`
- **Method**: `POST`
- **Authentication**: Admin password required
- **URL Parameters**:
  - `id`: Teacher ID
- **Request Body**:
  ```json
  {
    "subjectIds": ["uuid", "uuid"]
  }
  ```
- **Success Response (200)**:
  ```json
  {
    "message": "Subjects added successfully",
    "teacher": {
      "id": "uuid",
      "name": "string",
      "subjects": [
        {
          "id": "uuid",
          "name": "string"
        }
      ]
    }
  }
  ```
- **Error Responses**:
  - `400`: Subject IDs array is required
  - `401`: Unauthorized
  - `404`: Teacher not found / None of the provided subject IDs were found
  - `500`: Server error

#### Remove Subject from Teacher

Removes a subject from a teacher.

- **URL**: `/admin/teachers/:teacherId/subjects/:subjectId`
- **Method**: `DELETE`
- **Authentication**: Admin password required
- **URL Parameters**:
  - `teacherId`: Teacher ID
  - `subjectId`: Subject ID
- **Success Response (200)**:
  ```json
  {
    "message": "Subject removed from teacher successfully",
    "teacher": {
      "id": "uuid",
      "name": "string",
      "subjects": [
        {
          "id": "uuid",
          "name": "string"
        }
      ]
    }
  }
  ```
- **Error Responses**:
  - `401`: Unauthorized
  - `404`: Teacher not found / Subject not found / Subject not associated with teacher
  - `500`: Server error

### Season Management

#### Create Season

Creates a new season.

- **URL**: `/admin/seasons`
- **Method**: `POST`
- **Authentication**: Admin password required
- **Request Body**:
  ```json
  {
    "name": "string",
    "startDate": "ISO date string",
    "endDate": "ISO date string",
    "isActive": boolean
  }
  ```
- **Success Response (201)**:
  ```json
  {
    "message": "Season created successfully",
    "season": {
      "id": "uuid",
      "name": "string",
      "startDate": "ISO date string",
      "endDate": "ISO date string",
      "isActive": boolean
    }
  }
  ```
- **Error Responses**:
  - `400`: Season name, start date, and end date are required / End date must be after start date
  - `401`: Unauthorized
  - `500`: Server error

#### Update Season

Updates an existing season.

- **URL**: `/admin/seasons/:id`
- **Method**: `PUT`
- **Authentication**: Admin password required
- **URL Parameters**:
  - `id`: Season ID
- **Request Body**:
  ```json
  {
    "name": "string",
    "startDate": "ISO date string",
    "endDate": "ISO date string",
    "isActive": boolean
  }
  ```
- **Success Response (200)**:
  ```json
  {
    "message": "Season updated successfully",
    "season": {
      "id": "uuid",
      "name": "string",
      "startDate": "ISO date string",
      "endDate": "ISO date string",
      "isActive": boolean
    }
  }
  ```
- **Error Responses**:
  - `400`: End date must be after start date
  - `401`: Unauthorized
  - `404`: Season not found
  - `500`: Server error

#### Delete Season

Deletes a season.

- **URL**: `/admin/seasons/:id`
- **Method**: `DELETE`
- **Authentication**: Admin password required
- **URL Parameters**:
  - `id`: Season ID
- **Success Response (200)**:
  ```json
  {
    "message": "Season deleted successfully"
  }
  ```
- **Error Responses**:
  - `401`: Unauthorized
  - `404`: Season not found
  - `500`: Server error

### Card Generation

#### Generate Cards for Season

Generates cards for a specific season.

- **URL**: `/admin/seasons/:seasonId/generate-cards`
- **Method**: `POST`
- **Authentication**: Admin password required
- **URL Parameters**:
  - `seasonId`: Season ID
- **Request Body**:
  ```json
  {
    "amount": 10 // Optional: Number of cards to generate
  }
  ```
- **Success Response (201)**:
  ```json
  {
    "message": "Cards generated successfully",
    "cards": [
      {
        "id": "uuid",
        "type": "string",
        "level": 1,
        "teacher": {
          "id": "uuid",
          "name": "string"
        },
        "subject": {
          "id": "uuid",
          "name": "string"
        },
        "quote": {
          "id": "uuid",
          "text": "string"
        },
        "season": {
          "id": "uuid",
          "name": "string"
        }
      }
    ]
  }
  ```
- **Error Responses**:
  - `401`: Unauthorized
  - `404`: Season not found
  - `500`: Server error

#### Get Cards by Season ID

Retrieves all cards for a specific season.

- **URL**: `/admin/seasons/:seasonId/cards`
- **Method**: `GET`
- **Authentication**: Admin password required
- **URL Parameters**:
  - `seasonId`: Season ID
- **Success Response (200)**:
  ```json
  {
    "cards": [
      {
        "id": "uuid",
        "type": "string",
        "level": 1,
        "teacher": {
          "id": "uuid",
          "name": "string"
        },
        "subject": {
          "id": "uuid",
          "name": "string"
        },
        "quote": {
          "id": "uuid",
          "text": "string"
        },
        "season": {
          "id": "uuid",
          "name": "string"
        }
      }
    ]
  }
  ```
- **Error Responses**:
  - `401`: Unauthorized
  - `404`: Season not found
  - `500`: Server error

#### Delete Card

Deletes a card.

- **URL**: `/admin/cards/:id`
- **Method**: `DELETE`
- **Authentication**: Admin password required
- **URL Parameters**:
  - `id`: Card ID
- **Success Response (200)**:
  ```json
  {
    "message": "Card deleted successfully"
  }
  ```
- **Error Responses**:
  - `401`: Unauthorized
  - `404`: Card not found
  - `500`: Server error
