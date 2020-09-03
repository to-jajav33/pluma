export interface ProfilesStateInterface {
  profiles: ProfileInterfaceList
}

export interface ProfileInterfaceList {
  [profileID : string] : ProfileInterface
}

export interface ProfileInterface {
  id: string,
  variables : VariableInterfaceList
}

export interface VariableInterfaceList {
  [variableID : string] : VariableInterface
}

export interface VariableInterface {
  id: string,
  name: string
}

const state: ProfilesStateInterface = {
  profiles: {
    'default': {
      id: 'default',
      variables: {}
    }
  }
};

export default state;
