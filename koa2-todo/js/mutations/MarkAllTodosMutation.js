import Relay from 'react-relay';

export default class MarkAllTodosMutation extends Relay.Mutation {
  static fragments = {
    // TODO: Mark edges and totalCount optional
    todos: () => Relay.QL`
      fragment on TodoConnection {
        edges {
          node {
            complete,
            id,
          },
        },
      }
    `,
    viewer: () => Relay.QL`
      fragment on User {
        id,
        totalCount,
      }
    `,
  };
  getMutation() {
    return Relay.QL`mutation{markAllTodos}`;
  }
  getFatQuery() {
    return Relay.QL`
      fragment on MarkAllTodosPayload @relay(pattern: true) {
        viewer {
          completedCount,
          todos,
        },
      }
    `;
  }
  getConfigs() {
    return [{
      type: 'FIELDS_CHANGE',
      fieldIDs: {
        viewer: this.props.viewer.id,
      },
    }];
  }
  getVariables() {
    return {
      complete: this.props.complete,
    };
  }
  getOptimisticResponse() {
    const viewerPayload = { id: this.props.viewer.id };
    if (this.props.todos && this.props.todos.edges) {
      viewerPayload.todos = {
        edges: this.props.todos.edges
          .filter(edge => edge.node.complete !== this.props.complete)
          .map(edge => ({
            node: {
              complete: this.props.complete,
              id: edge.node.id,
            },
          })),
      };
    }
    if (this.props.viewer.totalCount != null) {
      viewerPayload.completedCount = this.props.complete ?
        this.props.viewer.totalCount :
        0;
    }
    return {
      viewer: viewerPayload,
    };
  }
}
