import React from 'react';
import { Button, CssBaseline, Grid } from '@material-ui/core';
import GroupAddIcon from '@material-ui/icons/GroupAdd';

export default class HomePage extends React.Component {

render() {
  return (
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
      </Grid>
    </React.Fragment>
  );}
}
