'use strict';

var React = require('react');
var PropTypes = require('prop-types');
var ReactScriptLoaderMixin = require('react-script-loader').ReactScriptLoaderMixin;

var PlaidLink = React.createClass({
  displayName: 'PlaidLink',

  mixins: [ReactScriptLoaderMixin],
  getDefaultProps: function getDefaultProps() {
    return {
      institution: null,
      selectAccount: false,
      buttonText: 'Open Link',
      style: {
        padding: '6px 4px',
        outline: 'none',
        background: '#FFFFFF',
        border: '2px solid #F1F1F1',
        borderRadius: '4px'
      }
    };
  },
  propTypes: {
    // Displayed once a user has successfully linked their account
    clientName: PropTypes.string.isRequired,

    // The Plaid API environment on which to create user accounts.
    // For development and testing, use tartan. For production, use production
    env: PropTypes.oneOf(['tartan', 'sandbox', 'development', 'production']).isRequired,

    // Open link to a specific institution, for a more custom solution
    institution: PropTypes.string,

    // The public_key associated with your account; available from
    // the Plaid dashboard (https://dashboard.plaid.com)
    publicKey: PropTypes.string.isRequired,

    // The Plaid products you wish to use, an array containing some of connect, 
    // auth, identity, income, transactions
    product: PropTypes.arrayOf(PropTypes.oneOf(['connect', 'auth', 'identity', 'income', 'transactions'])).isRequired,

    // Specify an existing user's public token to launch Link in update mode.
    // This will cause Link to open directly to the authentication step for
    // that user's institution.
    token: PropTypes.string,

    // Set to true to launch Link with the 'Select Account' pane enabled.
    // Allows users to select an individual account once they've authenticated
    selectAccount: PropTypes.bool,

    // Specify a webhook to associate with a user.
    webhook: PropTypes.string,

    // A function that is called when a user has successfully onboarded their
    // account. The function should expect two arguments, the public_key and a
    // metadata object
    onSuccess: PropTypes.func.isRequired,

    // A function that is called when a user has specifically exited Link flow
    onExit: PropTypes.func,

    // A function that is called when the Link module has finished loading.
    // Calls to plaidLinkHandler.open() prior to the onLoad callback will be
    // delayed until the module is fully loaded.
    onLoad: PropTypes.func,

    // Text to display in the button
    buttonText: PropTypes.string,

    // Button Styles as an Object
    style: PropTypes.object,

    // Button Class names as a String
    className: PropTypes.string,

    // A function to render the component.
    // When specified, buttonText, style, and className are ignored.
    // Assumes the rendered component is able to fire click events.
    renderComponent: PropTypes.func,

    // ApiVersion flag to use new version of Plaid API
    apiVersion: PropTypes.string
  },
  getInitialState: function getInitialState() {
    return {
      disabledButton: true,
      linkLoaded: false
    };
  },
  getScriptURL: function getScriptURL() {
    return 'https://cdn.plaid.com/link/v2/stable/link-initialize.js';
  },
  onScriptError: function onScriptError() {
    console.error('There was an issue loading the link-initialize.js script');
  },
  onScriptLoaded: function onScriptLoaded() {
    window.linkHandler = Plaid.create({
      clientName: this.props.clientName,
      env: this.props.env,
      key: this.props.publicKey,
      apiVersion: this.props.apiVersion,
      onExit: this.props.onExit,
      onLoad: this.handleLinkOnLoad,
      onSuccess: this.props.onSuccess,
      product: this.props.product,
      selectAccount: this.props.selectAccount,
      token: this.props.token,
      webhook: this.props.webhook
    });

    this.setState({ disabledButton: false });
  },
  handleLinkOnLoad: function handleLinkOnLoad() {
    this.props.onLoad && this.props.onLoad();
    this.setState({ linkLoaded: true });
  },
  handleOnClick: function handleOnClick() {
    this.props.onClick && this.props.onClick();
    var institution = this.props.institution || null;
    if (window.linkHandler) {
      window.linkHandler.open(institution);
    }
  },
  exit: function exit(configurationObject) {
    if (window.linkHandler) {
      window.linkHandler.exit(configurationObject);
    }
  },
  render: function render() {
    if (this.props.renderComponent) {
      var cmp = this.props.renderComponent();
      return React.cloneElement(cmp, { onClick: this.handleOnClick }); // we need to clone since props are frozen
    }

    return React.createElement(
      'button',
      {
        onClick: this.handleOnClick,
        disabled: this.state.disabledButton,
        style: this.props.style,
        className: this.props.className
      },
      React.createElement(
        'span',
        null,
        this.props.buttonText
      )
    );
  }
});

module.exports = PlaidLink;