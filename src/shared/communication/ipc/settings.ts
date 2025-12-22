export const SettingsIPC = {
  SELECT_FOLDER: 'electron:settings:select-directory',
  GET: 'electron:settings:get',
  GET_CONFIGS: 'electron:settings:get-configs',
  SET: 'electron:settings:set',
}

type AvailableSettings = 'default_save_directory'

export type SettingsIPCGetConfigsRequest = {
  settingsToFetch: AvailableSettings[]
}

export type SettingsIPCGetConfigsResponse = {
  [key in AvailableSettings]: string
}
