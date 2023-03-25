import Loader from './Loader';
import { Container, Table, useCollator, useAsyncList, Badge } from '@nextui-org/react';

const OutlierList = ({ name, outlierData }) => {
  const collator = useCollator({ numeric: true });
  async function load({ signal }) {
    const items = arrData();
    return {
      items,
    };
  }
  async function sort({ items, sortDescriptor }) {
    return {
      items: items.sort((a, b) => {
        const first = a[sortDescriptor.column];
        const second = b[sortDescriptor.column];
        let cmp = collator.compare(first, second);
        if (sortDescriptor.direction === 'descending') {
          cmp *= -1;
        }
        return cmp;
      }),
    };
  }
  const list = useAsyncList({ load, sort });

  const arrData = () => {
    const result = [];
    for (const i in outlierData) {
      const item = outlierData[i];
      result.push({
        id: i,
        wins: item.win,
        losses: item.lose,
        total: item.total,
        winPercent: item.winPercent + '%',
      });
    }
    return result;
  };

  return outlierData ? (
    <Container>
      <div className="button-container">
        <Badge color={'secondary'}>{name}</Badge>
      </div>
      <Table
        aria-label="User Data Table"
        css={{ height: '350px' }}
        sortDescriptor={list.sortDescriptor}
        onSortChange={list.sort}
      >
        <Table.Header>
          <Table.Column key="id" allowsSorting>
            Player ID
          </Table.Column>
          <Table.Column key="wins" allowsSorting>
            Wins
          </Table.Column>
          <Table.Column key="losses" allowsSorting>
            Losses
          </Table.Column>
          <Table.Column key="total" allowsSorting>
            Total Games
          </Table.Column>
          <Table.Column key="winPercent" allowsSorting>
            Win Percent
          </Table.Column>
        </Table.Header>
        <Table.Body items={list.items} loadingState={list.loadingState} onLoadMore={() => {}}>
          {(item) => (
            <Table.Row key={item.id}>
              {(columnKey) => <Table.Cell>{item[columnKey]}</Table.Cell>}
            </Table.Row>
          )}
        </Table.Body>
      </Table>
    </Container>
  ) : (
    <Loader />
  );
};

export default OutlierList;
