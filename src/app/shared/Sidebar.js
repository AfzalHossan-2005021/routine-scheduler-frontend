import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { Collapse } from 'react-bootstrap';

class Sidebar extends Component {

  state = {};

  toggleMenuState(menuState) {
    if (this.state[menuState]) {
      this.setState({[menuState] : false});
    } else if(Object.keys(this.state).length === 0) {
      this.setState({[menuState] : true});
    } else {
      Object.keys(this.state).forEach(i => {
        this.setState({[i]: false});
      });
      this.setState({[menuState] : true});
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.location !== prevProps.location) {
      this.onRouteChanged();
    }
  }

  onRouteChanged() {
    document.querySelector('#sidebar').classList.remove('active');
    Object.keys(this.state).forEach(i => {
      this.setState({[i]: false});
    });

    // Only open dropdowns for paths that are not /theory-schedule/new
    const dropdownPaths = [
      {path:'/apps', state: 'appsMenuOpen'},
      {path:'/database', state: 'dbUiMenuOpen'},
      {path:'/teachers', state: 'teachersMenuOpen'},
      {path:'/advanced-ui', state: 'advancedUiMenuOpen'},
      {path:'/theory-schedule', state: 'theoryScheduleMenuOpen'},
      {path:'/tables', state: 'tablesMenuOpen'},
      {path:'/maps', state: 'mapsMenuOpen'},
      {path:'/icons', state: 'iconsMenuOpen'},
      {path:'/charts', state: 'chartsMenuOpen'},
      {path:'/user-pages', state: 'userPagesMenuOpen'},
      {path:'/error-pages', state: 'errorPagesMenuOpen'},
      {path:'/general-pages', state: 'generalPagesMenuOpen'},
      {path:'/ecommerce', state: 'ecommercePagesMenuOpen'},
    ];

    dropdownPaths.forEach((obj => {
      // Do not open Theory Schedule menu for /theory-schedule/new
      if (obj.path === '/theory-schedule') {
        if (this.isPathActive(obj.path) && this.props.location.pathname !== '/theory-schedule/new') {
          this.setState({[obj.state] : true})
        }
      } else {
        if (this.isPathActive(obj.path)) {
          this.setState({[obj.state] : true})
        }
      }
    }));
 
  }

  render () {
    return (
      <nav className="sidebar sidebar-offcanvas" id="sidebar" style={{
        background: '#fff',
        borderRadius: '0 16px 16px 0',
        boxShadow: '0 6px 24px 0 rgba(154, 77, 226, 0.10)',
        border: 'none',
        minHeight: '100vh',
        paddingTop: 16,
        paddingBottom: 16,
        transition: 'background 0.3s, box-shadow 0.3s',
      }}>
        <style>{`
          .sidebar .nav-item {
            position: relative;
          }
          .sidebar .nav-item.active::before {
            content: '';
            position: absolute;
            left: 0; top: 8px; bottom: 8px;
            width: 4px;
            border-radius: 4px;
            background: linear-gradient(180deg, #c289f8 0%, #ae75e4 100%);
            z-index: 2;
            display: block;
          }
        `}</style>
        <ul className="nav">
          <li className={ this.isPathActive('/dashboard') ? 'nav-item active' : 'nav-item' }>
            <Link className="nav-link" to="/dashboard">
              <span className="menu-title">Dashboard</span>
              <i className="mdi mdi-home menu-icon"></i>
            </Link>
          </li>
          <li className={ this.isPathActive('/database') ? 'nav-item active' : 'nav-item' }>
            <div className={ this.state.dbUiMenuOpen ? 'nav-link menu-expanded' : 'nav-link' } onClick={ () => this.toggleMenuState('dbUiMenuOpen') } data-toggle="collapse">
              <span className="menu-title">Database</span>
              <i className="menu-arrow"></i>
              <i className="mdi mdi-database menu-icon"></i>
            </div>
            <Collapse in={ this.state.dbUiMenuOpen }>
              <ul className="nav flex-column sub-menu">
                <li className="nav-item"> <Link className={ this.isPathActive('/database/initialize') ? 'nav-link active' : 'nav-link' } to="/database/initialize">Initialize</Link></li>
                <li className="nav-item"> <Link className={ this.isPathActive('/database/teachers') ? 'nav-link active' : 'nav-link' } to="/database/teachers">Teachers</Link></li>
                <li className="nav-item"> <Link className={ this.isPathActive('/database/rooms') ? 'nav-link active' : 'nav-link' } to="/database/rooms">Rooms</Link></li>
                <li className="nav-item"> <Link className={ this.isPathActive('/database/courses') ? 'nav-link active' : 'nav-link' } to="/database/courses">Courses</Link></li>
                <li className="nav-item"> <Link className={ this.isPathActive('/database/sections') ? 'nav-link active' : 'nav-link' } to="/database/sections">Sections</Link></li>
              </ul>
            </Collapse>
          </li>
          <li className={ this.isPathActive('/theory-assign') ? 'nav-item active' : 'nav-item' }>
            <Link className="nav-link" to="/theory-assign">
              <span className="menu-title">Theory Assign</span>
              <i className="mdi mdi-clipboard-check menu-icon"></i>
            </Link>
          </li>
          <li className={ this.isPathActive('/lab-schedule') ? 'nav-item active' : 'nav-item' }>
            <Link className="nav-link" to="/lab-schedule">
              <span className="menu-title">Sessional Schedule</span>
              <i className="mdi mdi-timer-edit-outline menu-icon"></i>
            </Link>
          </li>
          <li className={ this.isPathActive('/room-assign') ? 'nav-item active' : 'nav-item' }>
            <Link className="nav-link" to="/room-assign">
              <span className="menu-title">Lab Room Assign</span>
              <i className="mdi mdi-lightbulb-variant-outline menu-icon"></i>
            </Link>
          </li>
          {/* Theory Schedule parent menu - only active for subroutes, not /theory-schedule/new */}
          {/* <li className={ (this.isPathActive('/theory-schedule') && this.props.location.pathname !== '/theory-schedule/new') ? 'nav-item active' : 'nav-item' }>
            <div className={ this.state.theoryScheduleMenuOpen ? 'nav-link menu-expanded' : 'nav-link' } onClick={ () => this.toggleMenuState('theoryScheduleMenuOpen') } data-toggle="collapse">
              <span className="menu-title">Theory Schedule</span>
              <i className="menu-arrow"></i>
              <i className="mdi mdi-clock-outline menu-icon"></i>
            </div>
            <Collapse in={ this.state.theoryScheduleMenuOpen }>
              <ul className="nav flex-column sub-menu">
                <li className="nav-item"> <Link className={ this.isPathActive('/theory-schedule/fixed') ? 'nav-link active' : 'nav-link' } to="/theory-schedule/fixed">Fixed Schedule</Link></li>
                <li className="nav-item"> <Link className={ this.isPathActive('/theory-schedule/ask') ? 'nav-link active' : 'nav-link' } to="/theory-schedule/ask">Ask for Schedule</Link></li>
              </ul>
            </Collapse>
          </li> */}
          {/* TheorySchedule(New) as a top-level menu item */}
          <li className={ this.props.location.pathname === '/theory-schedule/new' ? 'nav-item active' : 'nav-item' }>
            <Link className="nav-link" to="/theory-schedule/new">
              <span className="menu-title">Theory Schedule</span>
              <i className="mdi mdi-table-clock menu-icon"></i>
            </Link>
          </li>
          {/* <li className={ this.isPathActive('/teachers') ? 'nav-item active' : 'nav-item' }>
            <Link className="nav-link" to="/teachers">
              <span className="menu-title">Sessional Assign</span>
              <i className="mdi mdi-account-group menu-icon"></i>
            </Link>
          </li> */}
          <li className={ this.isPathActive('/lab-assign') ? 'nav-item active' : 'nav-item' }>
            <Link className="nav-link" to="/lab-assign">
              <span className="menu-title">Sessional Assign</span>
              <i className="mdi mdi-format-list-text menu-icon"></i>
            </Link>
          </li>
          <li className={ this.isPathActive('/pdf') ? 'nav-item active' : 'nav-item' }>
            <Link className="nav-link" to="/pdf">
              <span className="menu-title">Generate Routine</span>
              <i className="mdi mdi-file-pdf-box menu-icon"></i>
            </Link>
          </li>
        </ul>
      </nav>
    );
  }

  isPathActive(path) {
    return this.props.location.pathname.startsWith(path);
  }

  componentDidMount() {
    this.onRouteChanged();
    // add class 'hover-open' to sidebar navitem while hover in sidebar-icon-only menu
    const body = document.querySelector('body');
    document.querySelectorAll('.sidebar .nav-item').forEach((el) => {
      
      el.addEventListener('mouseover', function() {
        if(body.classList.contains('sidebar-icon-only')) {
          el.classList.add('hover-open');
        }
      });
      el.addEventListener('mouseout', function() {
        if(body.classList.contains('sidebar-icon-only')) {
          el.classList.remove('hover-open');
        }
      });
    });
  }

}

export default withRouter(Sidebar);