import * as React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import DatePicker from "react-datepicker";

import {
  Navbar,
  Loader,
  Row,
  Col,
  Input,
  Button,
  Line,
  Select,
  Option,
  Collapsed,
  Box,
  TextArea
} from "components";
import { User, WorkEntry } from "model";
import {
  fetchCurrentUser,
  putUser,
  fetchUsers,
  fetchUser,
  fetchUserWorkEntries,
  createWorkEntry,
  putWorkEntry,
  deleteWorkEntry,
  deleteUser
} from "api";
import { colors } from "styles";
import { isNumber, appendLeadingZeroes } from "utils";

import "react-datepicker/dist/react-datepicker.css";

interface DashboardState {
  currentUser?: User;
  searchedUser?: User;
  updatingSettings?: boolean;
  hoursError?: string;
  emailError?: string;
  usernameError?: string;
  nameError?: string;
  users: User[];
  loadingUser?: boolean;
  workEntries: WorkEntry[];
  collapsed: boolean[];
  newWorkEntry: { date?: Date; hours?: number; notes?: string };
  workEntriesErrorIndex?: number;
  workEntriesErrors?: string[];
  loading?: boolean;
  startDate: Date | null;
  endDate: Date | null;
}

const SelectWrapper = styled.div`
  position: relative;
  &:after {
    content: "▼";
    font-size: 14px;
    position: absolute;
    top: 5px;
    right: 10px;
    color: black;
  }
`;

const DatePickerWrapper = styled.div`
  display: inline;

  > .react-datepicker-wrapper {
    display: inline-block;
    > .react-datepicker__input-container {
      display: inline-block;
      width: 100%;
      > input {
        display: inline-block;
        width: 100%;
        padding: 5px;
        font-size: 16px;
        box-sizing: border-box;
        border: 2px solid ${colors.loginBg};
      }
    }
  }
`;

class Dashboard extends React.Component<any, DashboardState> {
  constructor(props: any) {
    super(props);

    this.state = {
      users: [],
      workEntries: [],
      collapsed: [],
      newWorkEntry: {},
      startDate: null,
      endDate: null
    };
  }

  componentDidMount() {
    fetchCurrentUser().then((r: any) =>
      this.setState({ currentUser: r.user }, () => {
        if (this.state.currentUser) {
          fetchUserWorkEntries(this.state.currentUser.id).then((r: any) =>
            this.setState({
              workEntries: r.workEntries,
              collapsed: new Array(r.workEntries.length + 1).fill(false)
            })
          );
          if (this.state.currentUser.role !== "user") {
            fetchUsers().then((r: any) => this.setState({ users: r.users }));
          }
        }
      })
    );
  }

  onUserChange = (e: React.SyntheticEvent<HTMLSelectElement>): void => {
    let { currentUser } = this.state;
    if (currentUser && currentUser.id) {
      if (Number(e.currentTarget.value) === Number(currentUser.id)) {
        fetchUserWorkEntries(currentUser.id).then((r: any) =>
          this.setState({
            searchedUser: undefined,
            workEntries: r.workEntries,
            collapsed: new Array(r.workEntries.length + 1).fill(false)
          })
        );
      } else {
        this.setState({ loadingUser: true });
        fetchUser(Number(e.currentTarget.value)).then((r: any) =>
          this.setState({ searchedUser: r.user, loadingUser: false }, () => {
            if (
              this.state.currentUser &&
              this.state.currentUser.role === "admin" &&
              this.state.searchedUser
            ) {
              fetchUserWorkEntries(this.state.searchedUser.id).then((r: any) =>
                this.setState({
                  workEntries: r.workEntries,
                  collapsed: new Array(r.workEntries.length + 1).fill(false)
                })
              );
            }
            this.clearUserErrors();
          })
        );
      }
    }
  };

  handlePrefferedHoursChange = (
    e: React.SyntheticEvent<HTMLInputElement>
  ): void => {
    let { currentUser, searchedUser } = this.state;

    let user: User | undefined = searchedUser || currentUser;

    if (!isNumber(e.currentTarget.value)) {
      return;
    }

    if (user) {
      user.prefferedWorkingHourPerDay = Number(e.currentTarget.value);
      if (searchedUser) {
        this.setState({ searchedUser: user, hoursError: undefined });
      } else {
        this.setState({ currentUser: user, hoursError: undefined });
      }
    }
  };

  handleEmailChange = (e: React.SyntheticEvent<HTMLInputElement>) => {
    let { currentUser, searchedUser } = this.state;

    let user: User | undefined = searchedUser || currentUser;

    if (user) {
      user.email = e.currentTarget.value;
      if (searchedUser) {
        this.setState({ searchedUser: user, emailError: undefined });
      } else {
        this.setState({ currentUser: user, emailError: undefined });
      }
    }
  };

  handleUsernameChange = (e: React.SyntheticEvent<HTMLInputElement>) => {
    let { currentUser, searchedUser } = this.state;

    let user: User | undefined = searchedUser || currentUser;

    if (user) {
      user.username = e.currentTarget.value;
      if (searchedUser) {
        this.setState({ searchedUser: user, usernameError: undefined });
      } else {
        this.setState({ currentUser: user, usernameError: undefined });
      }
    }
  };

  handleNameChange = (e: React.SyntheticEvent<HTMLInputElement>) => {
    let { currentUser, searchedUser } = this.state;

    let user: User | undefined = searchedUser || currentUser;

    if (user) {
      user.name = e.currentTarget.value;
      if (searchedUser) {
        this.setState({ searchedUser: user, usernameError: undefined });
      } else {
        this.setState({ currentUser: user, usernameError: undefined });
      }
    }
  };

  handleRoleChange = (e: React.SyntheticEvent<HTMLSelectElement>) => {
    let { currentUser, searchedUser } = this.state;

    let user: User | undefined = searchedUser || currentUser;

    if (user && e.currentTarget.value) {
      user.role = e.currentTarget.value;
      if (searchedUser) {
        this.setState({ searchedUser: user, usernameError: undefined });
      } else {
        this.setState({ currentUser: user, usernameError: undefined });
      }
    }
  };


  updateUserData = (): void => {
    let { currentUser, searchedUser } = this.state;

    this.setState({ updatingSettings: true });

    let user = searchedUser || currentUser;
    let hasErrors: boolean = false;

    if (user) {
      if (!user.email) {
        this.setState({ emailError: "Email not provided!" });
        hasErrors = true;
      }

      if (!user.username) {
        this.setState({ usernameError: "Username not provided!" });
        hasErrors = true;
      }

      if (!user.name) {
        this.setState({ nameError: "Name not provided!" });
        hasErrors = true;
      }

      if (hasErrors) {
        this.setState({ updatingSettings: false });
        return;
      }

      putUser(user.id, {
        email: user.email,
        prefferedWorkingHourPerDay: user.prefferedWorkingHourPerDay,
        role: user.role,
        username: user.username,
        name: user.name
      }).then((r: any) => this.setState({ updatingSettings: false }));
    }
  };

  createStringFromDate = (date: Date): string => {
    if (!date) return "";
    return (
      appendLeadingZeroes(date.getDate()) +
      "/" +
      appendLeadingZeroes(date.getMonth() + 1) +
      "/" +
      date.getFullYear()
    );
  };

  createDateFromString = (date: string): Date => {
    let splitted = date.split("/");

    return new Date(
      Number(splitted[2]),
      Number(splitted[1]) - 1,
      Number(splitted[0])
    );
  };

  saveWorkEntry = (): void => {
    let { newWorkEntry, currentUser, searchedUser } = this.state;

    let errors: string[] = [];
    let date: string = "";

    if (!newWorkEntry.date) {
      errors.push("Date can't be empty!");
    } else {
      date = this.createStringFromDate(newWorkEntry.date);
    }

    if (!newWorkEntry.hours) {
      errors.push("Hours can't be empty!");
    }

    if (errors.length > 0) {
      this.setState({ workEntriesErrorIndex: -1, workEntriesErrors: errors });
      return;
    }

    let user = searchedUser || currentUser;

    if (user) {
      createWorkEntry(user.id, {
        hours: newWorkEntry.hours || 0,
        date: date,
        notes: newWorkEntry.notes
      }).then((r: any) => {
        this.toggleCollapsed(0);
        this.setState({
          workEntries: [...this.state.workEntries, r.workEntry],
          newWorkEntry: {}
        });
        this.clearErrors();
      });
    }
  };

  updateWorkEntry = (index: number): void => {
    let { workEntries } = this.state;

    let workEntry = workEntries[index];

    let errors: string[] = [];

    if (!workEntry.date) {
      errors.push("Date can't be empty!");
    }

    if (!workEntry.hours) {
      errors.push("Hours can't be empty!");
    }

    if (errors.length > 0) {
      this.setState({
        workEntriesErrorIndex: index,
        workEntriesErrors: errors
      });
      return;
    }

    putWorkEntry(workEntries[index].id, workEntries[index]).then((r: any) => {
      this.toggleCollapsed(index + 1);
    });
  };

  deleteWorkEntries = (index: number) => {
    let { workEntries } = this.state;

    deleteWorkEntry(workEntries[index].id).then((r: any) => {
      workEntries.splice(index, 1);
      this.setState({ workEntries });
    });
  };

  clearErrors = (): void => {
    this.setState({ workEntriesErrorIndex: undefined, workEntriesErrors: [] });
  };

  clearUserErrors = (): void => {
    this.setState({nameError: undefined, usernameError: undefined, emailError: undefined});
  }

  onDateChange = (index: number, date: Date): void => {
    if (index < 0 && date) {
      this.setState({
        newWorkEntry: { ...this.state.newWorkEntry, date: date }
      });
    } else {
      let { workEntries } = this.state;
      let workEntry = workEntries[index];

      let d = this.createStringFromDate(date);

      if (d) {
        workEntry.date = d;
      }

      workEntries[index] = workEntry;

      this.setState({ workEntries });
    }
  };

  compareUsers = (currentUser: User, user: User): boolean => {
    return JSON.stringify(currentUser) === JSON.stringify(user);
  };

  onHoursChange = (index: number, hours: number): void => {
    if (index < 0) {
      this.setState({
        newWorkEntry: { ...this.state.newWorkEntry, hours: hours }
      });
    } else {
      let { workEntries } = this.state;
      let workEntry = workEntries[index];

      workEntry.hours = hours;

      workEntries[index] = workEntry;

      this.setState({ workEntries });
    }
  };

  onNotesChange = (index: number, notes: string): void => {
    if (index < 0) {
      this.setState({
        newWorkEntry: { ...this.state.newWorkEntry, notes: notes }
      });
    } else {
      let { workEntries } = this.state;
      let workEntry = workEntries[index];

      workEntry.notes = notes;

      workEntries[index] = workEntry;

      this.setState({ workEntries });
    }
  };

  toggleCollapsed = (index: number): void => {
    let { collapsed } = this.state;

    collapsed[index] = !collapsed[index];

    this.setState({ collapsed });
    this.clearErrors();
  };

  render() {
    let {
      currentUser,
      searchedUser,
      updatingSettings,
      usernameError,
      emailError,
      nameError,
      hoursError,
      users,
      workEntries,
      newWorkEntry,
      collapsed,
      workEntriesErrorIndex,
      workEntriesErrors,
      loading,
      startDate,
      endDate
    } = this.state;

    if (!currentUser || loading) {
      return <Loader global />;
    }

    let user = searchedUser || currentUser;

    workEntries = workEntries.filter((workEntry: WorkEntry) => {
      if (startDate && endDate) {
        let d = this.createDateFromString(workEntry.date);
        return d >= startDate && d <= endDate;
      }
      return true;
    });

    let renderWorkEntries = workEntries.map(
      (workEntry: WorkEntry, index: number) => (
        <Row key={index}>
          <Col w={10}>
            <Collapsed
              bgColor={colors.loginBg}
              borderColor={
                user.prefferedWorkingHourPerDay
                  ? workEntry.hours < user.prefferedWorkingHourPerDay
                    ? colors.red
                    : colors.green
                  : colors.loginBg
              }
              collapse={() => this.toggleCollapsed(index + 1)}
              title={workEntry.date}
              collapsed={collapsed[index + 1]}
              hours={workEntry.hours}
            >
              <Box bgColor={colors.loginBg}>
                <label style={{ display: "block" }}>Date</label>
                <DatePickerWrapper>
                  <DatePicker
                    onChange={(date: Date) => this.onDateChange(index, date)}
                    selected={this.createDateFromString(workEntry.date)}
                    dateFormat="dd/MM/yyyy"
                  />
                </DatePickerWrapper>
                <div style={{ margin: "10px 0" }} />

                <Input
                  label="Hours"
                  id="hours"
                  value={workEntry.hours || ""}
                  onChange={(e: React.SyntheticEvent<HTMLInputElement>) => {
                    if (!isNumber(e.currentTarget.value)) {
                      return;
                    }

                    this.onHoursChange(index, Number(e.currentTarget.value));
                  }}
                />
                <TextArea
                  label="Notes"
                  id="notes0"
                  value={workEntry.notes || ""}
                  onChange={(e: React.SyntheticEvent<HTMLTextAreaElement>) =>
                    this.onNotesChange(index, e.currentTarget.value)
                  }
                />
                <div style={{ textAlign: "right", marginBottom: "10px" }}>
                  <Button
                    backgroundColor={colors.green}
                    onClick={() => this.updateWorkEntry(index)}
                  >
                    Update
                  </Button>
                </div>

                {workEntriesErrorIndex === index &&
                  workEntriesErrors &&
                  workEntriesErrors.map((error: string, index: number) => (
                    <h5 key={index} style={{ color: colors.red }}>
                      {error}
                    </h5>
                  ))}
              </Box>
            </Collapsed>
          </Col>
          <Col>
            <Button
              style={{ marginTop: "4px" }}
              backgroundColor={colors.red}
              onClick={() => this.deleteWorkEntries(index)}
            >
              Delete
            </Button>
          </Col>
        </Row>
      )
    );

    return (
      <>
        <Navbar />
        <div style={{ overflow: "auto" }}>
          <div style={{ float: "left", marginLeft: "20px" }}>
            <h2 style={{ display: "inline-block", marginRight: "10px" }}>
              {user.name}
            </h2>

            {searchedUser &&
              searchedUser.id !== currentUser.id &&
              searchedUser.role !== "admin" && (
                <Button
                  backgroundColor={colors.red}
                  onClick={() => {
                    if (searchedUser) {
                      deleteUser(searchedUser.id).then((r: any) => {
                        this.setState({
                          searchedUser: undefined,
                          loading: true
                        });
                        fetchUsers().then((r: any) =>
                          this.setState({ users: r.users })
                        );
                        fetchUserWorkEntries(currentUser!.id).then((r: any) =>
                          this.setState(
                            {
                              workEntries: r.workEntries,
                              collapsed: new Array(
                                r.workEntries.length + 1
                              ).fill(false)
                            },
                            () => this.setState({ loading: false })
                          )
                        );
                      });
                    }
                  }}
                >
                  Delete
                </Button>
              )}
          </div>
        </div>

        <Row>
          <Col style={{ minWidth: "220px", marginLeft: "20px" }}>
            <h3>Settings {updatingSettings && <Loader />}</h3>
            <Input
              label="Email"
              value={user.email}
              error={emailError}
              onChange={this.handleEmailChange}
            />
            <Input
              label="Preffered Working Hour"
              value={user.prefferedWorkingHourPerDay}
              error={hoursError}
              onChange={this.handlePrefferedHoursChange}
            />
            <Input
              label="Username"
              value={user.username}
              error={usernameError}
              onChange={this.handleUsernameChange}
            />
            <Input
              label="Name"
              value={user.name}
              error={nameError}
              onChange={this.handleNameChange}
            />
            {currentUser.role === 'admin' && 
              <>
                <label>Role</label>
                <SelectWrapper style={{marginBottom: "10px"}}>
                  <Select value={user.role} onChange={this.handleRoleChange}>
                    <Option disabled value="default">
                      Pick role
                    </Option>
                    {['admin', 'user-manager', 'user'].map((role: string, index: number) => (
                      <Option value={role} key={index}>
                        {role}
                      </Option>
                    ))}
                  </Select>
                </SelectWrapper>
              </>
            }
            <div
              style={{ textAlign: "center", marginBottom: "20px" }}
            >
              <Button
                backgroundColor={colors.green}
                onClick={this.updateUserData}
              >
                Update
              </Button>
            </div>
            {currentUser.role !== "user" && (
              <>
                <Line />
                <SelectWrapper>
                  <Select value="default" onChange={this.onUserChange}>
                    <Option disabled value="default">
                      See user...
                    </Option>
                    {users.map((user: User, index: number) => (
                      <Option value={user.id} key={index}>
                        {user.username}
                      </Option>
                    ))}
                  </Select>
                </SelectWrapper>
              </>
            )}
          </Col>

          <Col w={10} style={{minWidth: "200px", marginLeft: "20px" }}>
            {(!searchedUser || currentUser.role === "admin") && (
              <>
                <Row>
                  <Col w={10}>
                    <h3 style={{ float: "left" }}>
                      Work Entries{" "}
                      <Button backgroundColor={colors.green}>
                        <Link
                          target="_blank"
                          style={{color: "white"}}
                          to={
                            startDate && endDate
                              ? `/sheet/${
                                  currentUser.id
                                }?start_date=${this.createStringFromDate(
                                  startDate
                                )}&end_date=${this.createStringFromDate(
                                  endDate
                                )}`
                              : `/sheet/${currentUser.id}`
                          }
                        >
                          Export
                        </Link>
                      </Button>
                    </h3>

                    <div style={{ float: "right", marginTop: "20px" }}>
                      Filter from/to
                      <DatePickerWrapper
                        style={{ marginRight: "10px", marginLeft: "10px" }}
                      >
                        <DatePicker
                          placeholderText="Start date"
                          selected={startDate}
                          dateFormat="dd/MM/yyyy"
                          onChange={startDate => this.setState({ startDate })}
                          isClearable={true}
                        />
                      </DatePickerWrapper>
                      <DatePickerWrapper>
                        <DatePicker
                          placeholderText="End date"
                          selected={endDate}
                          dateFormat="dd/MM/yyyy"
                          onChange={endDate => this.setState({ endDate })}
                          isClearable={true}
                        />
                      </DatePickerWrapper>
                    </div>
                    <div style={{ clear: "both" }} />
                  </Col>
                  <Col />
                </Row>
                <Row>
                  <Col w={10}>
                    <Collapsed
                      bgColor={colors.blue}
                      borderColor={colors.blue}
                      collapse={() => this.toggleCollapsed(0)}
                      title="Create new work entry"
                      collapsed={collapsed[0]}
                    >
                      <Box bgColor={colors.loginBg}>
                        <label style={{ display: "block" }}>Date</label>
                        <DatePickerWrapper>
                          <DatePicker
                            onChange={(date: Date) =>
                              this.onDateChange(-1, date)
                            }
                            selected={newWorkEntry.date}
                            dateFormat="dd/MM/yyyy"
                          />
                        </DatePickerWrapper>
                        <div style={{ margin: "10px 0" }} />

                        <Input
                          label="Hours"
                          id="hours"
                          value={newWorkEntry.hours || ""}
                          onChange={(
                            e: React.SyntheticEvent<HTMLInputElement>
                          ) => {
                            if (!isNumber(e.currentTarget.value)) {
                              return;
                            }

                            this.onHoursChange(
                              -1,
                              Number(e.currentTarget.value)
                            );
                          }}
                        />
                        <TextArea
                          label="Notes"
                          id="notes0"
                          value={newWorkEntry.notes || ""}
                          onChange={(
                            e: React.SyntheticEvent<HTMLTextAreaElement>
                          ) => this.onNotesChange(-1, e.currentTarget.value)}
                        />
                        <div
                          style={{ textAlign: "right", marginBottom: "10px" }}
                        >
                          <Button
                            backgroundColor={colors.green}
                            onClick={this.saveWorkEntry}
                          >
                            Create
                          </Button>
                        </div>

                        {workEntriesErrorIndex === -1 &&
                          workEntriesErrors &&
                          workEntriesErrors.map(
                            (error: string, index: number) => (
                              <h5 key={index} style={{ color: colors.red }}>
                                {error}
                              </h5>
                            )
                          )}
                      </Box>
                    </Collapsed>
                  </Col>
                  <Col />
                </Row>
                {renderWorkEntries}
              </>
            )}
          </Col>
        </Row>
      </>
    );
  }
}

export default Dashboard;
