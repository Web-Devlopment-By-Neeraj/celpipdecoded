"use client";

import { useState } from "react";
import { PlanUpgradeDialog } from "./PlanUpgradeDialog";

export function PlanUpgradeButton({
  productCode,
  offer,
  label = "Pay with card",
  className = "inline-flex h-11 items-center rounded-full bg-brand px-5 text-sm font-semibold text-white",
  withTopMargin = true,
}: {
  productCode: string;
  offer?: string;
  label?: string;
  className?: string;
  withTopMargin?: boolean;
}) {
  const [open, setOpen] = useState(false);

  const trigger = (
    <button type="button" onClick={() => setOpen(true)} className={className}>
      {label}
    </button>
  );

  return (
    <>
      {withTopMargin ? <div className="mt-4">{trigger}</div> : trigger}
      <PlanUpgradeDialog
        open={open}
        productCode={productCode}
        offer={offer}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
