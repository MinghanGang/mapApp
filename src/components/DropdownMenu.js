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
    return (
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
                <button onClick={this.props.selectTeam1}> Team 1</button>
                <button onClick={this.props.selectTeam2}> Team 2 </button>
                <button onClick={this.props.selectTeam3}> Team 3 </button>
              </div>
            )
            : (
              null
            )
        }
      </div>
    );
  }
}

export default Card;