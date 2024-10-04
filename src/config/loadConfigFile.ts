import path from 'path';
import { loadTsConfig } from 'config-file-ts-async';
import { CONFIG_FILE_NAME_NO_EXT, TS_CACHE_FOLDER_NAME } from '../constants.js';
import { Logger } from '../logger.js';
import { IConfigFile } from '../types/index.js';
import { existsAsync, scaffoldingPath } from '../util.js';

export async function loadConfigFile<TInput extends object>(
  templateDir: string,
  logging: Logger
): Promise<IConfigFile<TInput> | null> {
  const loaders = [
    { loader: loadTsConfigFile, extensions: ['.ts', '.mts', '.cts'] },
    { loader: loadJsConfigFile, extensions: ['.js', '.mjs', '.cjs'] },
  ];
  for (const extensionLoader of loaders) {
    for (const ext of extensionLoader.extensions) {
      const path = scaffoldingPath(templateDir, CONFIG_FILE_NAME_NO_EXT + ext);
      if (await existsAsync(path)) {
        return await extensionLoader.loader(path, logging);
      } else {
        logging.append(`No file at ${path}`, true);
      }
    }
  }
  logging.appendError(
    `Unable to find ${CONFIG_FILE_NAME_NO_EXT}.[js,mjs,ts,mts] in ${templateDir}`
  );
  return null;
}

async function loadJsConfigFile<TInput extends object>(
  configFileScaffoldingPath: string,
  logging: Logger
): Promise<IConfigFile<TInput> | null> {
  const modulePath =
    'file://' + path.join(process.cwd(), configFileScaffoldingPath);
  logging.append(`loading JS modulePath ${modulePath}`, true);
  try {
    const config = await import(modulePath);
    logging.append('  loaded', true);
    return config.default;
  } catch (e: unknown) {
    logging.appendError(`Failed to import ${modulePath}:\n ${e}`);
    return null;
  }
}

async function loadTsConfigFile<TInput extends object>(
  configFileScaffoldingPath: string,
  logging: Logger
): Promise<IConfigFile<TInput> | null> {
  logging.append(`loading TS module ${configFileScaffoldingPath}`, true);
  // const configPath = path.join(process.cwd(), configFileScaffoldingPath);
  const config = await loadTsConfig<IConfigFile<TInput>>(
    configFileScaffoldingPath,
    {
      cacheConfig: { cacheType: 'local', cacheDir: TS_CACHE_FOLDER_NAME },
      compileConfig: { strict: true, module: 'NodeNext' },
    }
  );
  if (!config) {
    logging.appendError(
      `failed to load ${configFileScaffoldingPath}, make sure the default export is a valid IConfigFile object`
    );
    return null;
  }

  logging.append('  loaded', true);
  return config;
}
