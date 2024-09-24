import {
  SlotsToClasses,
  Table,
  TableBody,
  TableColumn,
  TableHeader,
  TableProps,
  TableSlots,
} from "@nextui-org/react"

type DefTableProps = Omit<TableProps, "children"> & {
  headers: string[]
  children: JSX.Element | JSX.Element[]
}

const defTableStyles: SlotsToClasses<TableSlots> = {
  wrapper: ["shadow-none", "border", "border-input-border", "p-0", "bg-input-background-disabled"],
  thead: ["[&>tr>th]:bg-[#00000000]", "![&>tr]:last:none", "[&>tr]:bg-transparent [&>tr]:rounded-none rounded-none", "border-b border-input-border", "h-10 min-h-10"],
  tbody: ["![&>tr]:last:border-b-none", "![&>tr>td]:h-10",],
  tr: ["border-b", "border-input-border", "last:border-b-0", "h-10 min-h-10", "m-0"],
  th: ["!rounded-none", "text-base mt-1", "text-sm"],
  td: ["min-h-10", "h-10", "py-1", "*:text-sm", "[&>*>*]:text-sm"],
}


const DefTable = ({ headers, children }: DefTableProps) => {
  return (
    <Table classNames={defTableStyles}>
      <TableHeader>
        {headers.map((header) => (
          <TableColumn key={header} align="center" className="first-letter:uppercase">{header}</TableColumn>
        ))}
      </TableHeader>
      <TableBody>{children}</TableBody>
    </Table>
  )
}

export default DefTable
