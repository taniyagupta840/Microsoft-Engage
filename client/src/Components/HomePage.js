import React from 'react';
import { Box, Button, CssBaseline, Grid, Typography } from '@material-ui/core';
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
            <Typography
              variant="h4"
              color="primary"
            >
              <Box
                letterSpacing={10}
                fontFamily="Monospace"
                fontWeight="fontWeightBold"
              >
                AGILE TEAMS
              </Box>
            </Typography>
        </Grid>
        <Grid item>
            <Typography
              variant="h5"
              color="textSecondary"
            >
              <Box
                letterSpacing={8}
                fontFamily="Monospace"
                fontWeight="fontWeightMedium"
              >
                Connecting Worlds
              </Box>
            </Typography>
        </Grid>
        <Grid item>
          <Box m={5}>
            <Button
                variant="contained"
                color="primary"
                size="medium"
                startIcon={<GroupAddIcon />}
                onClick={() => this.props.isConnect(true)}
            >
                <b>Connect</b>
            </Button> 
          </Box>
        </Grid>
      </Grid>
      </React.Fragment>
      </div>
    );
  }
}
