import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { FaArrowCircleLeft, FaArrowCircleRight } from 'react-icons/fa';
import api from '../../services/api';

import Container from '../../components/Container';
import { Loading, Owner, IssueList } from './styles';

export default class Repository extends Component {
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        repository: PropTypes.string,
      }),
    }).isRequired,
  };

  state = {
    repository: {},
    issues: [],
    loading: true,
    issueFilter: 'all',
    issuePage: 1,
  };

  async componentDidMount() {
    this.loadIssues();
  }

  loadIssues = async () => {
    const { issueFilter, issuePage } = this.state;
    const { match } = this.props;

    const repoName = decodeURIComponent(match.params.repository);

    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`, {
        params: {
          state: issueFilter,
          per_page: 30,
          page: issuePage,
        },
      }),
    ]);

    this.setState({
      repository: repository.data,
      issues: issues.data,
      loading: false,
    });
  };

  handleIssueFilterChange = async e => {
    await this.setState({ issueFilter: e.target.value });
    this.loadIssues();
  };

  render() {
    const { repository, issues, loading, issueFilter, issuePage } = this.state;

    if (loading) {
      return <Loading>Carregando</Loading>;
    }

    return (
      <Container>
        <Owner>
          <Link to="/">Voltar aos repositórios</Link>
          <img src={repository.owner.avatar_url} alt={repository.owner.login} />
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>
        </Owner>
        <IssueList>
          <h2>Issues</h2>

          <div className="select-issues">
            <select value={issueFilter} onChange={this.handleIssueFilterChange}>
              <option selected value="all">
                All
              </option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          {issues.map(issue => (
            <li key={String(issue.id)}>
              <img src={issue.user.avatar_url} alt={issue.user.login} />
              <div>
                <strong>
                  <a href={issue.html_url}>{issue.title}</a>
                  {issue.labels.map(label => (
                    <span key={String(label.id)}>{label.name}</span>
                  ))}
                </strong>
                <p>{issue.user.login}</p>
              </div>
            </li>
          ))}
          <div className="page-count">
            {issuePage > 1 && (
              <button
                type="button"
                onClick={async () => {
                  await this.setState({ issuePage: issuePage - 1 });
                  this.loadIssues();
                }}
              >
                <FaArrowCircleLeft />
              </button>
            )}

            <span>{issuePage}</span>

            <button
              type="button"
              onClick={async () => {
                await this.setState({ issuePage: issuePage + 1 });
                this.loadIssues();
              }}
            >
              <FaArrowCircleRight />
            </button>
          </div>
        </IssueList>
      </Container>
    );
  }
}
