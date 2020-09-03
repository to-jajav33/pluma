import { ActionTree } from 'vuex';
import { StoreInterface } from '../index';
import { ProfilesStateInterface, VariableInterface } from './state';

export interface addVariableParams {
  profileID: string,
  variableInfo: VariableInterface
}

const actions: ActionTree<ProfilesStateInterface, StoreInterface> = {
  addVariable ({ state, commit }/* context */, params : addVariableParams) {
    const { profileID, variableInfo } = params;
    if (!variableInfo.id || !state.profiles[profileID].variables[variableInfo.id]) {
      commit('addVariable', params);
    }
  }
};

export default actions;
