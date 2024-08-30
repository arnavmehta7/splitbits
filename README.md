# SplitBits Project Explanation

## Project Overview

This project implements a smart contract called "SplitBits" for managing group expenses on the blockchain. It allows users to record debts, settle payments, and keep track of who owes whom. The contract uses a custom ERC20 token called "bobToken" for settlements.

Key features:
1. Record debts between users
2. Settle debts using the bobToken
3. View debts owed to a user
4. View debts a user needs to settle
5. Easily understand who owes whom :)

## Smart Contract Explanation

The `SplitBits` contract is written in Solidity and uses OpenZeppelin's SafeERC20 library for secure token transfers.

### Main Components

1. **Debt Struct**: Represents a debt with fields for debtor, creditor, amount, and settlement status.

2. **State Variables**:
   - `bobToken`: The ERC20 token used for settlements.
   - `debtsOwed`: Mapping of creditor addresses to arrays of debts owed to them.
   - `debtsToSettle`: Mapping of debtor addresses to arrays of debts they need to settle.

3. **Key Functions**:
   - `recordDebt`: Allows a user to record a debt owed by another user.
   - `settleDebt`: Enables a debtor to settle a specific debt by transferring bobTokens.
   - `getDebtsOwed` and `getDebtsToSettle`: View functions to retrieve debt information.

### Function Details

1. `recordDebt(address debtor, uint256 amount)`:
   - Records a new debt from the debtor to the caller (creditor).
   - Adds the debt to both `debtsOwed` and `debtsToSettle` mappings.
   - Emits a `DebtRecorded` event.

2. `settleDebt(address creditor, uint256 debtIndex)`:
   - Allows a debtor to settle a specific debt.
   - Marks the debt as settled in both mappings.
   - Transfers bobTokens from the debtor to the creditor.
   - Emits a `DebtSettled` event.

3. View functions:
   - `getDebtsOwed`: Returns all debts owed to a specific user.
   - `getDebtsToSettle`: Returns all debts a specific user needs to settle.

## Future TODOs

1. **Description for each debt/payment**:
   - Add a `description` field to the `Debt` struct.
   - Modify the `recordDebt` function to include a description parameter.
   - Update relevant functions and events to incorporate the description.

2. **Escrow for bulk payments to everyone**:
   - Implement an escrow mechanism to hold funds for multiple debt settlements.
   - Create functions for depositing into escrow and releasing funds to creditors.
   - Add safety measures to ensure proper fund distribution.

3. **Ability to create new groups and assign emails/names alongside**:
   - Implement a `Group` struct to represent expense-sharing groups.
   - Create functions for group creation, member addition, and management.
   - Associate email addresses and names with group members for easier identification.
   - Modify debt recording and settlement to work within group contexts.

By implementing these TODOs, the SplitBits contract will become more feature-rich and user-friendly, providing a comprehensive solution for group expense management on the blockchain.