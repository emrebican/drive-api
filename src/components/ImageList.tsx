import React from "react";
import { Table, TableProps } from "antd";
import { DataType } from "../models/DataType.model";

export const ImageList: React.FC<{ imageFiles: any[] }> = ({ imageFiles }) => {
  const columns: TableProps<DataType>["columns"] = [
    {
      title: "File Name",
      dataIndex: "name",
      key: "name",
      render: (text, record: any) => (
        <a href={record.webViewLink} target="_blank" rel="noopener noreferrer">
          {text}
        </a>
      ),
    },
    {
      title: "Type",
      dataIndex: "mimeType",
      key: "mimeType",
      render: (text) => text.split("/")[1],
    },
  ];

  return <Table<DataType> columns={columns} dataSource={imageFiles} rowKey="id" />;
};
