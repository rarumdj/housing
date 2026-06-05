declare module 'naija-state-local-government' {
  interface NigeriaState {
    state: string;
    senatorial_districts: string[];
    lgas: string[];
  }

  const naija: {
    all: () => NigeriaState[];
    states: () => string[];
    senatorial_districts: (state: string) => string[];
    lgas: (state: string) => NigeriaState;
  };

  export default naija;
}
