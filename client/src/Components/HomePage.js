import React from 'react'
import { Button, CssBaseline, Grid } from '@material-ui/core';
import GroupAddIcon from '@material-ui/icons/GroupAdd';
import Birds from 'vanta/dist/vanta.birds.min';

export default class App extends React.Component {
  constructor() {
    super()
    this.vantaRef = React.createRef()
  }
  componentDidMount() {
    this.vantaEffect = Birds({
      el: this.vantaRef.current,
      backgroundColor: 0xffffff,
      birdSize: 1.30,
      wingSpan: 20.00,
      separation: 25.00,
    })
  }
  componentWillUnmount() {
    if (this.vantaEffect) this.vantaEffect.destroy()
  }

  render() {
    return( 
      <div ref={this.vantaRef}>
      <React.Fragment>
      <CssBaseline />
      <Grid
        container
        spacing={0}
        direction="column"
        alignItems="center"
        justify="center"
        style={{ minHeight: '100vh' }}
      >
        <Grid item>
            <Button
                variant="contained"
                color="primary"
                size="medium"
                startIcon={<GroupAddIcon />}
                onClick={() => this.props.isConnect(true)}
            >
                <b>Connect</b>
            </Button>
        </Grid>
          {/* <Chat /> */}
      </Grid>
      </React.Fragment>
      </div>
    );
  }
}
