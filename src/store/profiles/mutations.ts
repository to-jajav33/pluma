import { MutationTree } from 'vuex';
import { ProfilesStateInterface } from './state';
import { uid } from 'quasar';
import { addVariableParams } from './actions';

const mutation: MutationTree<ProfilesStateInterface> = {
  addVariable (state : ProfilesStateInterface /* state: ExampleStateInterface */, params : addVariableParams) {
    const { profileID, variableInfo } = params;

    if (!variableInfo.id || !state.profiles[profileID].variables[variableInfo.id]) {
      state.profiles[profileID].variables[variableInfo.id] = {
        id: uid(),
        name: variableInfo.name
      }
    }
  }
};

export default mutation;
