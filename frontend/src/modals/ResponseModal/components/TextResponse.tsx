import { Textarea } from "@nextui-org/react"
import { useEffect } from "react"
import { responseType } from "../../../types/ResponseTypes"

const TextResponse = ({
  response,
  setData,
}: {
  response: responseType
  setData: React.Dispatch<React.SetStateAction<responseType>>
}) => {
  useEffect(() => {
    if (!response.data[0].text) {
      setData({
        ...response,
        type: "text",
        data: [
          {
            priority: 1,
            text: "",
          },
        ],
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const changeResponseValue = (value: string) => {
    setData({
      ...response,
      type: "text",
      data: [
        {
          priority: 1,
          text: value,
        },
      ],
    })
  }

  return (
    <div>
      <Textarea
        placeholder="Enter text response"
        variant="bordered"
        value={response.data[0].text}
        onChange={(e) => changeResponseValue(e.target.value)}
        minRows={8}
        maxRows={14}
      />
    </div>
  )
}

export default TextResponse
