"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, X, Star } from "lucide-react";

const plans = [
  {
    name: "Basic",
    monthlyPrice: 9,
    annualPrice: 99,
    included: ["Feature A", "Feature B", "Feature C"],
    excluded: ["Feature C", "Feature D"],
  },
  {
    name: "Pro",
    monthlyPrice: 19,
    annualPrice: 199,
    included: ["Feature A", "Feature B", "Feature C"],
    excluded: ["Feature C", "Feature D"],
    popular: true,
  },
  {
    name: "Enterprise",
    monthlyPrice: 39,
    annualPrice: 399,
    included: ["Feature A", "Feature B", "Feature C"],
    excluded: ["Feature C", "Feature D"],
  },
];

export default function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <section className="relative overflow-hidden bg-white">
      {/* TOP GRADIENT HEADER */}
      <div className="absolute inset-0 h-[500] bg-[linear-gradient(to_bottom,#193950_0%,#194560_13%,#157CA8_57%,rgba(21,124,168,0)_99%)]"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-20">
        {/* HEADER */}
        <div className="text-center text-white mb-14">
          <h2 className="text-4xl font-bold mb-2">Pricing Plans</h2>
          <p className="text-sm opacity-80 mb-8">
            Short Description Starting the Plans that are too affordable
          </p>

          {/* TOGGLE */}
          <div className="flex items-center justify-center gap-3">
            <span className="text-sm opacity-80">Monthly</span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative w-12 h-6 rounded-full transition ${
                isAnnual ? "bg-white" : "bg-white/60"
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-cyan-900 transition-transform ${
                  isAnnual ? "translate-x-6" : ""
                }`}
              />
            </button>
            <span className="text-sm opacity-80">Annually</span>
          </div>
        </div>

        {/* CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
          {plans.map((plan, index) => {
            const isFeatured = index === 1;

            return (
              <div
                key={plan.name}
                className="relative rounded-2xl border-2 bg-linear-to-br from-white to-cyan-50 text-start transition shadow-lg  border-cyan-800/60"
              >
                <div className="p-8">
                  <h3 className="text-3xl font-bold text-slate-800 mb-4">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-slate-500 mb-2">
                    Starting at
                  </p>
                  <p className="text-4xl font-bold text-slate-800 mb-4">
                    ${isAnnual ? plan.annualPrice : plan.monthlyPrice}
                    <span className="text-lg font-normal">/{isAnnual ? 'year' : 'month'}</span>
                  </p>
                  <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                    This plan offers essential features for growing your business.
                    Perfect for startups and small teams looking to scale.
                  </p>

                  <button className="w-full mb-6 px-6 py-3 bg-slate-800 text-white rounded-lg font-semibold cursor-pointer hover:bg-cyan-500 transition">
                    Get Started
                  </button>

                  <hr className="mb-6 border-slate-300" />

                  <ul className="space-y-3 text-sm text-slate-700 text-left">
                    {plan.included.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <CheckCircle className="mt-1 w-4 h-4 text-green-500 shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );

}