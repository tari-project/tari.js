import {
  SubstateDiff,
  VaultId,
  Vault,
  SubstateId,
  SubstateValue,
  ResourceContainer,
  ResourceAddress,
  Amount,
  RejectReason,
  substateIdToString,
  ComponentAddress,
} from "@tari-project/typescript-bindings";
import { FinalizeResultStatus } from "../FinalizeResult";
import { UpSubstates } from "../SubstateDiff";

function isOfType<T extends object>(obj: T, key: keyof T): boolean {
  return obj !== null && typeof obj === "object" && key in obj;
}

export const txResultCheck = {
  isAccept: (result: FinalizeResultStatus): result is { Accept: SubstateDiff } => {
    return "Accept" in result;
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

  isReject: (result: FinalizeResultStatus): result is { Reject: RejectReason } => {
    return "Reject" in result;
  },
  isAcceptFeeRejectRest: (
    result: FinalizeResultStatus,
  ): result is { AcceptFeeRejectRest: [SubstateDiff, RejectReason] } => {
    return "AcceptFeeRejectRest" in result;
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
  const templateAddressBytes = new TextEncoder().encode(templateAddress);
  for (const [substateId, substate] of upSubstates) {
    if ("Component" in substate.substate) {
      const componentHeader = substate.substate.Component;
      if (componentHeader.template_address === templateAddressBytes) {
        components.push(substateIdToString(substateId));
      }
    }
  }
  return components;
}
