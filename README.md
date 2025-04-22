# EF Website
This website is a project for the EF Informatik. The goal is to create a website that is essentially a card collecting game. The ideas, as well as their status of implementation, are listed out in the following section. This repository contains all code related to the project.
## Ideas
- [ ] Battles
  - Held in seasons
  - Every card can be matched up against any other card, other than itself
  - Every teacher gets one card for each subject they teach. Each season a new card with a new quotes is generated, with the quote being picked randomly
  - Elo system to pair up similarly popular teachers
  - Daily free votes
  - Final rankings posted at the end of each season
  - Some updates posted in between
- [ ] Card Collecting
  - Daily free packs
  - Cards available forever
  - Season specific cards -> S1 card is a different card than S2 card
  - Duplicates can be upgraded
- [ ] Cards
  - Card rating, based on seasonal Elo
  - Upgrades with stat multipliers
  - Unwanted cards can be sold for packs, where upgraded cards are worth the amount of cards they cost
- [ ] Trainers
  - Limited amount of space for cards per season
  - Cards organized by season
  - Trainer rating based on sum of ratings of cards
  - Top Trainers posted weekly, together with their best card
- [ ] Card Trading
## Tasks
### Backend
- [ ] Authentication
- [ ] Database
- [ ] Elo system
- [ ] REST API
  - [ ] Authentication
  - [ ] Data fetching
  - [ ] Voting
  - [ ] Trading
  - [ ] Selling cards
  - [ ] Opening packs
