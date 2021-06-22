// linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)
import React from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import Button from '@material-ui/core/Button';
import GroupAddIcon from '@material-ui/icons/GroupAdd';
import { Grid } from '@material-ui/core';

export default class SimpleContainer extends React.Component {
  constructor(props) {
      super(props);
  }

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
        <Grid>
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
