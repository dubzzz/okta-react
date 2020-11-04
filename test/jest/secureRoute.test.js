import React from 'react';
import { mount } from 'enzyme';
import { MemoryRouter, Route } from 'react-router-dom';
import SecureRoute from '../../src/SecureRoute';
import Security from '../../src/Security';

describe('<SecureRoute />', () => {
  let oktaAuth;
  let authState;
  let mockProps;

  beforeEach(() => {
    authState = {
      isPending: true
    };
    oktaAuth = {
      options: {},
      authStateManager: {
        getAuthState: jest.fn().mockImplementation(() => authState),
        subscribe: jest.fn(),
        updateAuthState: jest.fn(),
      },
      isLoginRedirect: jest.fn().mockImplementation(() => false),
      handleLoginRedirect: jest.fn(),
      signInWithRedirect: jest.fn(),
      setOriginalUri: jest.fn()
    };
    mockProps = { oktaAuth };
  });

  describe('isAuthenticated: true', () => {

    beforeEach(() => {
      authState.isAuthenticated = true;
      authState.isPending = false;
    });

    it('will render wrapped component using "component"', () => {
      const MyComponent = function() { return <div>hello world</div>; };
      const wrapper = mount(
        <MemoryRouter>
          <Security {...mockProps}>
            <SecureRoute
              component={MyComponent}
            />
          </Security>
        </MemoryRouter>
      );
      expect(wrapper.find(MyComponent).html()).toBe('<div>hello world</div>');
    });

    it('will render wrapped component using "render"', () => {
      const MyComponent = function() { return <div>hello world</div>; };
      const wrapper = mount(
        <MemoryRouter>
          <Security {...mockProps}>
            <SecureRoute
              render={ () => <MyComponent/> }
            />
          </Security>
        </MemoryRouter>
      );
      expect(wrapper.find(MyComponent).html()).toBe('<div>hello world</div>');
    });

    it('will render wrapped component as a child', () => {
      const MyComponent = function() { return <div>hello world</div>; };
      const wrapper = mount(
        <MemoryRouter>
          <Security {...mockProps}>
            <SecureRoute>
              <MyComponent/>
            </SecureRoute>
          </Security>
        </MemoryRouter>
      );
      expect(wrapper.find(MyComponent).html()).toBe('<div>hello world</div>');
    });
  });

  describe('isAuthenticated: false', () => {

    beforeEach(() => {
      authState.isAuthenticated = false;
      authState.isPending = false;
    });

    it('will not render wrapped component using "component"', () => {
      const MyComponent = function() { return <div>hello world</div>; };
      const wrapper = mount(
        <MemoryRouter>
          <Security {...mockProps}>
            <SecureRoute
              component={MyComponent}
            />
          </Security>
        </MemoryRouter>
      );
      expect(wrapper.find(MyComponent).length).toBe(0);
    });

    it('will not render wrapped component using "render"', () => {
      const MyComponent = function() { return <div>hello world</div>; };
      const wrapper = mount(
        <MemoryRouter>
          <Security {...mockProps}>
            <SecureRoute
              render={ () => <MyComponent/> }
            />
          </Security>
        </MemoryRouter>
      );
      expect(wrapper.find(MyComponent).length).toBe(0);
    });

    it('will not render wrapped component with children', () => {
      const MyComponent = function() { return <div>hello world</div>; };
      const wrapper = mount(
        <MemoryRouter>
          <Security {...mockProps}>
            <SecureRoute>
              <MyComponent/>
            </SecureRoute>
          </Security>
        </MemoryRouter>
      );
      expect(wrapper.find(MyComponent).length).toBe(0);
    });

    describe('isPending: false', () => {

      beforeEach(() => {
        authState.isPending = false;
      });

      describe('route matches', () => {
        it('calls signInWithRedirect() if route matches', () => {
          mount(
            <MemoryRouter>
              <Security {...mockProps}>
                <SecureRoute path="/" />
              </Security>
            </MemoryRouter>
          );
          expect(oktaAuth.setOriginalUri).toHaveBeenCalled();
          expect(oktaAuth.signInWithRedirect).toHaveBeenCalled();
        });
  
        it('calls onAuthRequired if provided from Security', () => {
          const onAuthRequired = jest.fn();
          mount(
            <MemoryRouter>
              <Security {...mockProps} onAuthRequired={onAuthRequired}>
                <SecureRoute path="/" />
              </Security>
            </MemoryRouter>
          );
          expect(oktaAuth.setOriginalUri).toHaveBeenCalled();
          expect(oktaAuth.signInWithRedirect).not.toHaveBeenCalled();
          expect(onAuthRequired).toHaveBeenCalledWith(oktaAuth);
        });

        it('calls onAuthRequired from SecureRoute if provide from both Security and SecureRoute', () => {
          const onAuthRequired1 = jest.fn();
          const onAuthRequired2 = jest.fn();
          mount(
            <MemoryRouter>
              <Security {...mockProps} onAuthRequired={onAuthRequired1}>
                <SecureRoute path="/" onAuthRequired={onAuthRequired2} />
              </Security>
            </MemoryRouter>
          );
          expect(oktaAuth.setOriginalUri).toHaveBeenCalled();
          expect(oktaAuth.signInWithRedirect).not.toHaveBeenCalled();
          expect(onAuthRequired1).not.toHaveBeenCalled();
          expect(onAuthRequired2).toHaveBeenCalledWith(oktaAuth);
        });
      });

      describe('route does not match', () => {
        it('does not call signInWithRedirect()', () => {
          mount(
            <MemoryRouter>
              <Security {...mockProps}>
                <SecureRoute path="/other" />
              </Security>
            </MemoryRouter>
          );
          expect(oktaAuth.setOriginalUri).not.toHaveBeenCalled();
          expect(oktaAuth.signInWithRedirect).not.toHaveBeenCalled();
        });
      });
    });

    describe('isPending: true', () => {

      beforeEach(() => {
        authState.isPending = true;
      });

      it('does not call signInWithRedirect()', () => {
        mount(
          <MemoryRouter>
            <Security {...mockProps}>
              <SecureRoute />
            </Security>
          </MemoryRouter>
        );
        expect(oktaAuth.signInWithRedirect).not.toHaveBeenCalled();
      });
    });
  });

  describe('when authenticated', () => { 
    const MyComponent = function() { return <div>hello world</div>; };
    beforeEach(() => {
      authState.isPending = false;
      authState.isAuthenticated = true;
    });

    it('should accept a "path" prop and render a component', () => {
      const wrapper = mount(
        <MemoryRouter>
          <Security {...mockProps}>
            <SecureRoute
              path='/'
              component={MyComponent}
            />
          </Security>
        </MemoryRouter>
      );
      expect(wrapper.find(SecureRoute).props().path).toBe('/');
      expect(wrapper.find(MyComponent).html()).toBe('<div>hello world</div>');
    });

    it('should accept an "exact" prop and pass it to an internal Route', () => {
      const wrapper = mount(
        <MemoryRouter>
          <Security {...mockProps}>
            <SecureRoute
              exact={true}
              path='/'
              component={MyComponent}
            />
          </Security>
        </MemoryRouter>
      );
      const secureRoute = wrapper.find(SecureRoute);
      expect(secureRoute.find(Route).props().exact).toBe(true);
      expect(wrapper.find(MyComponent).html()).toBe('<div>hello world</div>');
    });

    it('should accept a "strict" prop and pass it to an internal Route', () => {
      const wrapper = mount(
        <MemoryRouter>
          <Security {...mockProps}>
            <SecureRoute
              strict={true}
              path='/'
              component={MyComponent}
            />
          </Security>
        </MemoryRouter>
      );
      const secureRoute = wrapper.find(SecureRoute);
      expect(secureRoute.find(Route).props().strict).toBe(true);
      expect(wrapper.find(MyComponent).html()).toBe('<div>hello world</div>');
    });

    it('should accept a "sensitive" prop and pass it to an internal Route', () => {
      const wrapper = mount(
        <MemoryRouter>
          <Security {...mockProps}>
            <SecureRoute
              sensitive={true}
              path='/'
              component={MyComponent}
            />
          </Security>
        </MemoryRouter>
      );
      const secureRoute = wrapper.find(SecureRoute);
      expect(secureRoute.find(Route).props().sensitive).toBe(true);
      expect(wrapper.find(MyComponent).html()).toBe('<div>hello world</div>');
    });

    it('should pass react-router props to an component', () => {
      authState.isAuthenticated = true;
      const MyComponent = function(props) { return <div>{ props.history ? 'has history' : 'lacks history'}</div>; };
      const wrapper = mount(
        <MemoryRouter>
          <Security {...mockProps}>
            <SecureRoute
              path='/'
              component={MyComponent}
            />
          </Security>
        </MemoryRouter>
      );
      expect(wrapper.find(MyComponent).html()).toBe('<div>has history</div>');
    });

    it('should pass react-router props to a render call', () => {
      authState.isAuthenticated = true;
      const MyComponent = function(props) { return <div>{ props.history ? 'has history' : 'lacks history'}</div>; };
      const wrapper = mount(
        <MemoryRouter>
          <Security {...mockProps}>
            <SecureRoute
              path='/'
              render = {props => <MyComponent {...props} />}
            />
          </Security>
        </MemoryRouter>
      );
      expect(wrapper.find(MyComponent).html()).toBe('<div>has history</div>');
    });

    it('should pass props using the "render" prop', () => {
      authState.isAuthenticated = true;
      const MyComponent = function(props) { return <div>{ props.someProp ? 'has someProp' : 'lacks someProp'}</div>; };
      const wrapper = mount(
        <MemoryRouter>
          <Security {...mockProps}>
            <SecureRoute
              path='/'
              render={ () => <MyComponent someProp={true}/> }
            />
          </Security>
        </MemoryRouter>
      );
      expect(wrapper.find(MyComponent).html()).toBe('<div>has someProp</div>');
    });

  });
});
