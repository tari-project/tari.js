import {
  VaultId,
  Vault,
  SubstateId,
  SubstateValue,
  ResourceContainer,
  ResourceAddress,
  Amount,
  substateIdToString,
  ComponentAddress, FinalizeResult,
} from "@tari-project/typescript-bindings";
import { UpSubstates } from "../SubstateDiff";

function isOfType<T extends object>(obj: T, key: keyof T): boolean {
  return obj !== null && typeof obj === "object" && key in obj;
}

export const txResultCheck = {
  isAccept: (result: FinalizeResult) => {
    return "Accept" in result.result;
  },

  isVaultId: (substateId: SubstateId): substateId is { Vault: VaultId } => {
    return isOfType(substateId, "Vault" as keyof SubstateId);
  },

  isVaultSubstate: (substate: SubstateValue): substate is { Vault: Vault } => {
    return "Vault" in substate;
  },

  isFungible: (
    resourceContainer: ResourceContainer,
  ): resourceContainer is { Fungible: { address: ResourceAddress; amount: Amount; locked_amount: Amount } } => {
    return "Fungible" in resourceContainer;
  },

  isReject: (result: FinalizeResult): boolean => {
    return "Reject" in result.result;
  },
  isAcceptFeeRejectRest: (
    result: FinalizeResult,
  ): boolean => {
    return "AcceptFeeRejectRest" in result.result;
  },
};

export function getSubstateValueFromUpSubstates(
  substateType: keyof SubstateValue | string,
  upSubstates: UpSubstates,
): UpSubstates {
  const components: UpSubstates = [];
  for (const [substateId, substate] of upSubstates) {
    if (substateType in substate.substate) {
      components.push([substateId, substate]);
    }
  }
  return components;
}

export function getComponentsForTemplate(templateAddress: string, upSubstates: UpSubstates): ComponentAddress[] | null {
  const components: ComponentAddress[] = [];
  for (const [substateId, substate] of upSubstates) {
    if ("Component" in substate.substate) {
      const componentHeader = substate.substate.Component;
      if (componentHeader.template_address === templateAddress) {
        components.push(substateIdToString(substateId));
      }
    }
  }
  return components;
}
