import React from 'react';
import { Scoring } from './misc.js';
import './ScoreCard.css';

const ScoreCard = (props) => {
  const nameCells = props.scores.map((score, i) => {
    return (
      <td key={i}>{score.name.substr(0, 2)}</td>
    );
  });
  const detailRows = Object.keys(Scoring).map((key, i) => {
    const detailCells = props.scores.map((score, i) => {
      return (
        <td key={i}>{score.details[Scoring[key]]}</td>
      );
    });
    return (
      <tr key={i}>{detailCells}</tr>
    );
  });
  const totalScoreCells = props.scores.map((score, i) => {
    return (
      <td key={i}>{score.total}</td>
    );
  });
  return (
    <div className="ScoreCard" style={{ backgroundImage: 'url("' + process.env.REACT_APP_ASSET_URL_PREFIX + 'Assets/Score.jpg")' }}>
      <table>
        <tbody>
          <tr>{nameCells}</tr>
          {detailRows}
          <tr>{totalScoreCells}</tr>
        </tbody>
      </table>
    </div>
  );
};

export default ScoreCard;
