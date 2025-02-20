---
sidebar_position: 3
---

# Instructions

There are nine types of instructions. In most cases, you will not need to create raw instructions yourself but will instead use one of the methods provided by the Transaction Builder.

## CreateAccount

```json
{
  "CreateAccount": {
    "owner_public_key": string,
    "workspace_bucket": string | null
  }
}
```

## CallFunction

```json
{
  "CallFunction": {
    "template_address": string,
    "function": string,
    "args": any[]
  }
}
```

## CallMethod

```json
{
  "CallMethod": {
    "component_address": string,
    "method": string,
    "args": any[]
  }
}
```

## PutLastInstructionOutputOnWorkspace

```json
{
  "PutLastInstructionOutputOnWorkspace": {
    "key": number[]
  }
}
```

## EmitLog

```json
{
  "EmitLog": {
    "level": "Error" | "Warn" | "Info" | "Debug",
    "message": string
  }
}
```

## ClaimBurn


```json
{
  "ClaimBurn": {
    "claim": {
      "publicKey": string,
      "outputAddress": string,
      "rangeProof": number[],
      "proofOfKnowledge": string,
      "withdrawProof": ConfidentialWithdrawProof | null,
    }
  }
}
```

## ClaimValidatorFees

```json
{
  "ClaimValidatorFees": {
    "epoch": number,
    "validator_public_key": string
  }
}
```

## DropAllProofsInWorkspace

```json
DropAllProofsInWorkspace
```

## CreateFreeTestCoins

```json
{
  "CreateFreeTestCoins": {
    "revealed_amount": string,
    "output": ConfidentialOutput | null
  }
}
```