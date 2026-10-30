export interface QueryResult<Row> {
  rows: Row[];
  rowCount: number | null;
}

export interface DatabaseClient {
  query<Row = Record<string, unknown>>(sql: string, parameters?: readonly unknown[]): Promise<QueryResult<Row>>;
  release(): void;
}

export interface DatabasePool {
  connect(): Promise<DatabaseClient>;
}
