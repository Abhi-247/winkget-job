"use client";

import { useState } from "react";
import { ShieldAlert, AlertTriangle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";

export function ImposterDisclaimer() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-2 text-slate-800">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm sm:text-base">
          <ShieldAlert size={18} className="text-amber-500 shrink-0" />
          <span>Beware of imposters!</span>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          WinkGetJob does not promise a job or an interview in exchange of money. Fraudsters may ask you to pay in the pretext of registration fee, Refundable Fee...{" "}
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="text-blue-600 hover:text-blue-800 font-semibold underline cursor-pointer inline"
          >
            Read more
          </button>
        </p>
      </div>

      {showModal && (
        <Modal
          open={showModal}
          onClose={() => setShowModal(false)}
          title="Safety & Fraud Prevention Disclaimer"
          size="md"
        >
          <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-amber-900">
              <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-950">Important Notice</p>
                <p className="text-xs text-amber-800 mt-0.5">
                  WinkGetJob is completely free for job seekers and task claimants to apply for jobs or bid on tasks.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="font-bold text-slate-900">Common Red Flags to Watch Out For:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-600 text-xs sm:text-sm">
                <li>Asking for money under the pretext of Registration Fee, Refundable Security Deposit, Processing Fee, or Laptop/Training Fee.</li>
                <li>Requesting payments via personal UPI IDs or bank accounts prior to hiring or assigning tasks.</li>
                <li>Conducting interviews exclusively via unverified messaging channels without official company details.</li>
                <li>Guaranteed job selection or high payouts in exchange for upfront payments.</li>
              </ul>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <p className="font-semibold text-slate-900 mb-1">What to do if you encounter a suspicious post?</p>
              <p className="text-xs text-slate-600">
                Never transfer money to any employer or task client. If anyone demands payment, report the job or task immediately to WinkGetJob Support.
              </p>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
