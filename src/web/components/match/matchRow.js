import React from 'react';
import TeamFlag from './teamFlag';
import axios from 'axios';
import * as Day from '../../day';

function showScore(score) {
  if (score) {
    return `${score.home}-${score.away}`;
  }
  return "vs";
}

function showDate(dateAsString) {
  const date = new Date(dateAsString);
  var options = {month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric'};
  return date.toLocaleString('en-US', options);
}

function getScoreResult(score) {
  if(score.home > score.away) {
    return "home";
  }
  if(score.home < score.away) {
    return "away";
  }
  return "draw";
}

function showPredictionResult(match) {
  const noResult = <span data-id="prediction-result"></span>;
  const guessedResult = <i className="fas guessed-prediction" data-id="prediction-result"></i>;
  const missedResult = <i className="fas missed-prediction" data-id="prediction-result"></i>;

  if (!match.score || !match.prediction) {
    return noResult;
  }

  if (getScoreResult(match.score) === match.prediction) {
    return guessedResult;
  }
  return missedResult;
}

export default class MatchRow extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      match : props.match,
      displayPrediction : props.displayPrediction,
      userId: props.userId,
      editingIsEnabled : props.editingIsEnabled
    };
  }

  changesAreAllowed() {
    return this.state.editingIsEnabled && !Day.isInThePast(this.state.match.date);
  }

  onChange(event) {
    const match = this.state.match;

    if (!this.changesAreAllowed()) return;

    const value = event.target.value;
    match.prediction = value;

    this.setState( { match :match });

    const prediction = value;
    const userId = this.state.userId;
    axios.patch(`/api/user/${userId}/match/${match.id}`, { prediction})
  }

  displayPrediction() {
    const match = this.state.match;

    if (!this.state.displayPrediction)
      return;

    return <div className="col">
      <select data-id="prediction" onChange={this.onChange.bind(this)}
              value={match.prediction} disabled={!this.changesAreAllowed()}>
        <option> -- choose result --</option>
        <option value="home">{match.home}</option>
        <option value="draw">draw</option>
        <option value="away">{match.away}</option>
      </select> {showPredictionResult(match)}
    </div>;
  }

  render() {
    const match = this.state.match;

    return (
      <div className={"row align-items-center rounded match-row " +
      (Day.isToday(match.date) ? "match-today" : "")}>
        <div className="col">
          <span className="float-right"><span data-id="home">{match.home}</span> <TeamFlag name={match.home}/></span>
        </div>
        <div className="col-1">
          <span data-id="score">{showScore(match.score)}</span>
        </div>
        <div className="col">
          <TeamFlag name={match.away}/> <span data-id="away">{match.away}</span>
        </div>
        <div className="col">
          {showDate(match.date)}
        </div>
        <div className="col">
          <span className="float-right stage" data-id="stage">{match.stage}</span>
        </div>
        { this.displayPrediction()}
      </div>
    );
  }
}
