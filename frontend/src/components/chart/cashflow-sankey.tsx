import { Sankey, Tooltip, ResponsiveContainer, Layer, Rectangle } from 'recharts'
import { useCurrencyFormatter } from '@/lib/use-currency-formatter'

interface CashflowData {
  nodes: { name: string }[]
  links: { source: number; target: number; value: number }[]
  totalIncome: number
}

type NodeProps = {
  x: number
  y: number
  width: number
  height: number
  index: number
  payload: { name: string }
  containerWidth: number
}

function SankeyNode({ x, y, width, height, index, payload, containerWidth }: NodeProps) {
  const isOut = x + width + 6 > containerWidth / 2
  return (
    <Layer key={`node-${index}`}>
      <Rectangle
        x={x}
        y={y}
        width={width}
        height={height}
        fill={payload.name === 'Cash Flow' ? 'var(--primary)' : 'var(--chart-4)'}
        fillOpacity={payload.name === 'Cash Flow' ? 1 : 0.85}
        radius={3}
      />
      <text
        x={isOut ? x - 8 : x + width + 8}
        y={y + height / 2}
        textAnchor={isOut ? 'end' : 'start'}
        dominantBaseline="middle"
        fontSize={12}
        fill="var(--foreground)"
      >
        {payload.name}
      </text>
    </Layer>
  )
}

export function CashflowSankey({ data: apiData }: { data: CashflowData }) {
  const formatCurrency = useCurrencyFormatter()
  const hubIndex = apiData.nodes.findIndex((n) => n.name === 'Cash Flow')
  if (hubIndex === -1 || apiData.links.length === 0) {
    return (
      <div className="h-[200px] sm:h-[360px] flex items-center justify-center text-muted-foreground text-sm">
        Not enough data to display cash flow.
      </div>
    )
  }

  return (
    <div className="h-[200px] w-full sm:h-[360px]">
      <ResponsiveContainer width="100%" height="100%">
        <Sankey
          data={{ nodes: apiData.nodes, links: apiData.links }}
          nodePadding={26}
          nodeWidth={12}
          margin={{ top: 12, right: 90, bottom: 12, left: 90 }}
          link={{ stroke: 'var(--primary)', strokeOpacity: 0.25 }}
          node={<SankeyNode x={0} y={0} width={0} height={0} index={0} payload={{ name: '' }} containerWidth={0} />}
        >
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              const p = payload[0]?.payload
              const value = p?.value ?? p?.payload?.value
              return (
                <div className="rounded-xl border border-border bg-popover px-3 py-2 shadow-lg">
                  <p className="font-heading text-sm text-foreground">
                    {formatCurrency(Number(value))}
                  </p>
                </div>
              )
            }}
          />
        </Sankey>
      </ResponsiveContainer>
    </div>
  )
}
