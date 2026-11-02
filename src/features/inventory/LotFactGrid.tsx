import type { InventoryItem } from "../../types/api";
import { CARD_GROUPS, formatCardValue } from "./cardFields";
import { PriceLines } from "./PriceLines";

export function LotFactGrid({ item }: { item: InventoryItem }) {
  const groups = CARD_GROUPS.filter((group) => group.id !== "sale")
    .map((group) => ({
      group,
      facts: group.fields
        .map((field) => ({ field, value: formatCardValue(item, field.id) }))
        .filter((fact) => fact.value !== "—"),
    }))
    .filter((section) => section.facts.length > 0);
  const showSale = Boolean(item.estimateStatus);

  return (
    <div className="flex min-h-0 flex-col gap-4">
      {showSale ? (
        <section className="min-w-0 rounded-[10px] bg-surface-muted px-3.5 py-3">
          <h2 className="mb-2 text-[11px] font-medium uppercase tracking-[0.12em] text-muted">Sale info</h2>
          <PriceLines item={item} tone="panel" />
        </section>
      ) : null}
      <div className="grid grid-cols-2 gap-x-4 gap-y-4 sm:gap-x-5">
        {groups.map(({ group, facts }, index) => {
          const span = groups.length % 2 === 1 && index === groups.length - 1;
          return (
            <section key={group.id} className={`min-w-0 space-y-2 ${span ? "col-span-2" : ""}`}>
              <h2 className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted">{group.label}</h2>
              <dl className={span ? "grid grid-cols-2 gap-x-4 gap-y-2 sm:gap-x-5" : "space-y-2"}>
                {facts.map(({ field, value }) => (
                  <div key={field.id} className="min-w-0">
                    <dt className="text-xs text-muted">{field.label}</dt>
                    <dd className="text-[15px] leading-5 break-words text-ink" title={value}>
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          );
        })}
      </div>
    </div>
  );
}
