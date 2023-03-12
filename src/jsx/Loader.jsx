import Spinner from './Spinner';
import React, { usestate } from 'react';

const Loader = () => {
  return (
    <div>
      <h1 className="centerText">Loading. Script takes 3-5 minutes to run, please be patient</h1>
      <Spinner size="large" />
    </div>
  );
};

export default Loader;
