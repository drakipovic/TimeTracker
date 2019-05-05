import * as React from "react";

import {
  fetchUser,
  fetchCurrentUser,
  fetchFilteredUserWorkEntries,
  fetchUserWorkEntries
} from "api";
import { colors } from "styles";
import { WorkEntry } from "model";

interface SheetState {
  workEntries: WorkEntry[];
  error?: string;
}

class Sheet extends React.Component<any, SheetState> {
  constructor(props: any) {
    super(props);

    this.state = { workEntries: [] };
  }
  componentDidMount() {
    const params = new URLSearchParams(this.props.location.search);

    Promise.all([
      fetchCurrentUser(),
      fetchUser(this.props.match.params.userId)
    ]).then(values => {
      if (values[0]["user"] && values[1]["user"]) {
        if (
          values[0]["user"]["role"] !== "admin" &&
          values[0]["user"]["id"] !== values[1]["user"]["id"]
        ) {
          this.setState({
            error: "Exporting other users work entries is not permited!"
          });
        } else {
          params.get("start_date") && params.get("end_date")
            ? fetchFilteredUserWorkEntries(
                this.props.match.params.userId,
                params.get("start_date"),
                params.get("end_date")
              ).then((r: any) => this.setState({ workEntries: r.workEntries }))
            : fetchUserWorkEntries(this.props.match.params.userId).then(
                (r: any) => this.setState({ workEntries: r.workEntries })
              );
        }
      }
    });
  }

  render() {
    let { error, workEntries } = this.state;

    if (error) {
      return (
        <h2
          style={{
            textAlign: "center",
            marginTop: "20px",
            color: colors.red
          }}
        >
          {error}
        </h2>
      );
    }

    return (
      <>
        {workEntries &&
          workEntries.map((workEntry: WorkEntry, index: number) => (
            <div key={index} style={{ padding: "20px" }}>
              * Date: {workEntry.date} <br />* Total time: {workEntry.hours}
              {"h "}
              <br />
              * Notes: <br />
              {workEntry.notes}
              <hr />
            </div>
          ))}
      </>
    );
  }
}

export default Sheet;
