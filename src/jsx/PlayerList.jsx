'use client';
import { Table, useAsyncList, useCollator, Container } from '@nextui-org/react';
import Loader from './Loader';

const PlayerList = ({ playerData }) => {
  const collator = useCollator({ numeric: true });
  async function load({ signal }) {
    const items = Object.values(playerData); // convert playerData object to array
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

  return playerData ? (
    <Container>
      <Table
        aria-label="User Data Table"
        css={{ height: '500px' }}
        sortDescriptor={list.sortDescriptor}
        onSortChange={list.sort}
      >
        <Table.Header>
          <Table.Column key="Player ID" allowsSorting>
            Player ID
          </Table.Column>
          <Table.Column key="Wins" allowsSorting>
            Wins
          </Table.Column>
          <Table.Column key="Losses" allowsSorting>
            Losses
          </Table.Column>
          <Table.Column key="Total Games" allowsSorting>
            Total Games
          </Table.Column>
          <Table.Column key="Win Percent" allowsSorting>
            Win Percent
          </Table.Column>
        </Table.Header>
        <Table.Body items={Object.values(playerData)} loadingState={list.loadMore} onLoadMore={() => {}}>
          {(item) => (
            <Table.Row key={Object.keys(playerData).find((key) => playerData[key] === item)}>
              <Table.Cell css={{ color: 'white' }}>
                {Object.keys(playerData).find((key) => playerData[key] === item)}
              </Table.Cell>
              <Table.Cell css={{ color: 'white !important' }}>{item.win}</Table.Cell>
              <Table.Cell css={{ color: 'white !important' }}>{item.lose}</Table.Cell>
              <Table.Cell css={{ color: 'white !important' }}>{item.total}</Table.Cell>
              <Table.Cell css={{ color: 'white !important' }}>{item.winPercent}%</Table.Cell>
            </Table.Row>
          )}
        </Table.Body>
      </Table>
    </Container>
  ) : (
    <Loader />
  );
};


const PlayerList2 = ({ playerData }) => {
  const collator = useCollator({ numeric: true });
  async function load({ signal }) {
    const res = await fetch("https://swapi.py4e.com/api/people/?search", {
      signal,
    });
    const json = await res.json();
    return {
      items: json.results,
    };
  }
  async function sort({ items, sortDescriptor }) {
    return {
      items: items.sort((a, b) => {
        let first = a[sortDescriptor.column];
        let second = b[sortDescriptor.column];
        let cmp = collator.compare(first, second);
        if (sortDescriptor.direction === "descending") {
          cmp *= -1;
        }
        return cmp;
      }),
    };
  }
  const list = useAsyncList({ load, sort });
  return (
    <Table
      aria-label="Example static collection table"
      css={{ minWidth: "100%", height: "100px" }}
      sortDescriptor={list.sortDescriptor}
      onSortChange={list.sort}
    >
      <Table.Header>
        <Table.Column key="name" allowsSorting>
          Name
        </Table.Column>
        <Table.Column key="height" allowsSorting>
          Height
        </Table.Column>
        <Table.Column key="mass" allowsSorting>
          Mass
        </Table.Column>
        <Table.Column key="birth_year" allowsSorting>
          Birth Year
        </Table.Column>
      </Table.Header>
      <Table.Body items={list.items} loadingState={list.loadingState}>
        {(item) => (
          <Table.Row key={item.name}>
            {(columnKey) => <Table.Cell>{item[columnKey]}</Table.Cell>}
          </Table.Row>
        )}
        
      </Table.Body>
    </Table>
  );
}

export default PlayerList;
