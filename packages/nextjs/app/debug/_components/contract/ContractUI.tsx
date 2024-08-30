"use client";

import { useReducer } from "react";
import { Address, Balance } from "~~/components/scaffold-eth";
import { useDeployedContractInfo, useNetworkColor } from "~~/hooks/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { ContractName } from "~~/utils/scaffold-eth/contract";
import { useContractRead, useContractWrite, useAccount } from "wagmi";
import { ethers } from "ethers";

type ContractUIProps = {
  contractName: ContractName;
  className?: string;
};

export const ContractUI = ({ contractName, className = "" }: ContractUIProps) => {
  const [refreshDebts, triggerRefreshDebts] = useReducer(value => !value, false);
  const { targetNetwork } = useTargetNetwork();
  const { data: deployedContractData, isLoading: deployedContractLoading } = useDeployedContractInfo(contractName);
  const networkColor = useNetworkColor();
  const { address } = useAccount();


  const { data: debtsOwed, refetch: refetchDebtsOwed } = useContractRead({
    address: deployedContractData?.address,
    abi: deployedContractData?.abi,
    functionName: "getDebtsOwed",
    args: [address],
    enabled: !!deployedContractData?.address && !!address,
  });

  const { data: debtsToSettle, refetch: refetchDebtsToSettle } = useContractRead({
    address: deployedContractData?.address,
    abi: deployedContractData?.abi,
    functionName: "getDebtsToSettle",
    args: [address],
    enabled: !!deployedContractData?.address && !!address,
  });

  const { writeAsync: recordDebt } = useContractWrite({
    address: deployedContractData?.address,
    abi: deployedContractData?.abi,
    functionName: "recordDebt",
  });

  const { writeAsync: settleDebt } = useContractWrite({
    address: deployedContractData?.address,
    abi: deployedContractData?.abi,
    functionName: "settleDebt",
  });

  const handleRecordDebt = async (debtor: string, amount: string) => {
    await recordDebt({ args: [debtor, ethers.parseEther(amount)] });
    console.log("Recorded debt");
    triggerRefreshDebts();
  };

// ... existing code ...

const handleSettleDebt = async (creditor: string, debtIndex: number) => {
  try {
    await settleDebt({ args: [creditor, debtIndex] });
    triggerRefreshDebts();
  } catch (error) {
    if (error.message.includes("insufficient amount")) {
      alert("Insufficient BOB. Please fund the wallet to spend the required amount of BOB.");
    } else {
      console.error("Error settling debt:", error);
      alert("An error occurred while settling the debt. Please try again.");
    }
  }
};

// ... existing code ...

  if (deployedContractLoading) {
    return (
      <div className="mt-14">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!deployedContractData) {
    return (
      <p className="text-3xl mt-14">
        {`No contract found by the name of "${contractName}" on chain "${targetNetwork.name}"!`}
      </p>
    );
  }
  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 ${className}`}>
      <div>
        <h2 className="text-2xl font-bold mb-4">Contract Details</h2>
        <div className="bg-base-100 border-base-300 border shadow-md shadow-secondary rounded-3xl p-6 mb-6">
          <p>
            <span className="font-bold">Address:</span> <Address address={deployedContractData.address} />
          </p>
          {targetNetwork && (
            <p>
              <span className="font-bold">Network:</span> <span style={{ color: networkColor }}>{targetNetwork.name}</span>
            </p>
          )}
        </div>

        <h2 className="text-2xl font-bold mb-4">Record Debt</h2>
        <div className="bg-base-100 border-base-300 border shadow-md shadow-secondary rounded-3xl p-6 mb-6">
          <input
            type="text"
            placeholder="Debtor Address"
            className="input input-bordered w-full mb-4"
            id="debtorAddress"
          />
          <input type="text" placeholder="Amount" className="input input-bordered w-full mb-4" id="debtAmount" />
          <button
            className="btn btn-primary"
            onClick={() => {
              const debtor = (document.getElementById("debtorAddress") as HTMLInputElement).value;
              const amount = (document.getElementById("debtAmount") as HTMLInputElement).value;
              handleRecordDebt(debtor, amount);
            }}
          >
            Record Debt
          </button>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Debts Owed to Me</h2>
        {debtsOwed?.map((debt, index) => (
          <div key={index} className="bg-base-100 border-base-300 border shadow-md shadow-secondary rounded-3xl p-6 mb-6">
            <p>
              <span className="font-bold">Debtor:</span> <Address address={debt.debtor} />
            </p>
            <p>
              <span className="font-bold">Amount:</span> {ethers.formatEther(debt.amount)} BOB
            </p>
            <p>
              <span className="font-bold">Settled:</span> {debt.settled ? "Yes" : "No"}
            </p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Debts I Need to Settle</h2>
        {debtsToSettle?.map((debt, index) => (
          <div key={index} className="bg-base-100 border-base-300 border shadow-md shadow-secondary rounded-3xl p-6 mb-6">
            <p>
              <span className="font-bold">Creditor:</span> <Address address={debt.creditor} />
            </p>
            <p>
              <span className="font-bold">Amount:</span> {ethers.formatEther(debt.amount)} BOB
            </p>
            <p>
              <span className="font-bold">Settled:</span> {debt.settled ? "Yes" : "No"}
            </p>
            {!debt.settled && (
              <button className="btn btn-primary mt-4" onClick={() => handleSettleDebt(debt.creditor, index)}>
                Settle Debt
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};