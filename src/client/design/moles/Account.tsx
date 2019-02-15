import React from 'react';
import styled from 'styled-components';

const Container = styled('div')`
  padding: 10px 24px 12px 24px;
  cursor: pointer;
  font-size: 15px;
  grid-gap: 0 12px;
  display: grid;
  grid-template-columns: max-content auto max-content;
  white-space: normal;
  align-items: center;
  position: relative;

  &:hover {
    background: #fafafa;
  }

  &:after {
    left: 24px;
    right: 24px;
    content: '';
    border-bottom: 1px solid #dadce0;
    position: absolute;
    bottom: 0;
    height: 0;
  }
`;

const Identicon = styled('div')`
  width: 28px;
  height: 28px;
  border-radius: 999rem;
  line-height: 28px;
  text-align: center;
  background: black;
  color: white;
`;

const Name = styled('div')`
  font-size: 15px;
  font-weight: 600;
  line-height: 1.25;
`;

const Address = styled('div')`
  color: #3c4043;
  font-size: 13px;
  word-break: break-all;
`;

const Account = ({ accountName, handleClick }) => {
  const initial = accountName.slice(0, 1);
  return (
    <Container onClick={() => handleClick(accountName)}>
      <Identicon>{initial}</Identicon>
      <div>
        <Name>
          {accountName}
        </Name>
        <Address>
          indegser@gmail.com
        </Address>
      </div>
    </Container>
  )
}

export default Account;