import React, { Component } from 'react';

class Card extends Component {
  constructor() {
    super();
    
    this.state = {
      showMenu: false,
    };
    
    this.showMenu = this.showMenu.bind(this);
    this.closeMenu = this.closeMenu.bind(this);
  }
  
  showMenu(event) {
    event.preventDefault();
    
    this.setState({ showMenu: true }, () => {
      document.addEventListener('click', this.closeMenu);
    });
  }
  
  closeMenu(event) {
    
    if (!this.dropdownMenu.contains(event.target)) {
      
      this.setState({ showMenu: false }, () => {
        document.removeEventListener('click', this.closeMenu);
      });  
      
    }
  }

  render() {
    /*return (
      <div>
        <button onClick={this.showMenu}>
          Select Team
        </button>
        
        {
          this.state.showMenu
            ? (
              <div
                className="menu"
                ref={(element) => {
                  this.dropdownMenu = element;
                }}
              >
                <label><input id="Team1Check" type="checkbox" onClick={()=>this.props.selectTeam()}></input>Team 1</label>
                <label><input id="Team2Check" type="checkbox" onClick={()=>this.props.selectTeam()}></input>Team 2</label>
                <label><input id="Team3Check" type="checkbox" onClick={()=>this.props.selectTeam()}></input>Team 3</label>
              </div>
            )
            : (
              null
            )
        }
      </div>
    );*/
    return (
      <div>
        <span>
          <label id="Team1"><input id="Team1Check" type="checkbox" onClick={()=>this.props.update(1)}></input>Team 1</label>
          <label id="Team2"><input id="Team2Check" type="checkbox" onClick={()=>this.props.update(2)}></input>Team 2</label>
          <label id="Team3"><input id="Team3Check" type="checkbox" onClick={()=>this.props.update(3)}></input>Team 3</label>
        </span>
        <span>
          <button onClick={()=>this.props.simulate(5)}>
            Start Simulation
          </button>
        </span>
      </div>
    );
  }
}

export default Card;