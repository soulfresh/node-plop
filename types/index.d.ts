import inquirer = require('inquirer');
// @types/globby doesn't export types for GlobOptions, so we have to work a little bit to extract them:
// GlobOptions is the second parameter of the sync function, which can be extracted with the Parameters<T> type
import { sync as _sync } from 'globby';
type GlobOptions = Parameters<typeof _sync>[1];
import { HelperDelegate as HelperFunction } from 'handlebars';

interface NodePlopAPI {
	getGenerator(name: string): PlopGenerator;
	setGenerator(name: string, config: PlopGeneratorOptions): PlopGenerator;

	setPrompt(name: string, prompt: inquirer.PromptModule): void;
	setWelcomeMessage(message: string): void;
	getWelcomeMessage(): string;
	getGeneratorList(): { name: string; description: string }[];
	setPartial(name: string, str: string): void;
	getPartial(name: string): string;
	getPartialList(): string[];
	setHelper(name: string, fn: HelperFunction): void;
	getHelper(name: string): Function;
	getHelperList(): string[];
	setActionType(name: string, fn: CustomActionFunction): void;
	getActionType(name: string): ActionType;
	getActionTypeList(): string[];

	setPlopfilePath(filePath: string): void;
	getPlopfilePath(): string;
	getDestBasePath(): string;

	// plop.load functionality
	load(target: string[] | string, loadCfg: PlopCfg, includeOverride: boolean): void;
	setDefaultInclude(inc: object): void;
	getDefaultInclude(): object;

	renderString(template: string, data: any): string; //set to any matching handlebars declaration

	// passthroughs for backward compatibility
	addPrompt(name: string, prompt: inquirer.PromptModule): void;
	addPartial(name: string, str: string): void;
	addHelper(name: string, fn: Function): void;
}

interface PlopActionHooksFailures {
	type: string;
	path: string;
	error: string;
	message: string;
}

interface PlopActionHooksChanges {
	type: string;
	path: string;
}

interface PlopActionHooks {
	onComment?: (msg: string) => void;
	onSuccess?: (change: PlopActionHooksChanges) => void;
	onFailure?: (failure: PlopActionHooksFailures) => void;
}

export interface PlopGeneratorOptions {
	description: string;
	prompts: Prompts;
	actions: Actions;
}

export interface PlopGenerator {
	description: string;
	prompts: Prompts;
	actions: Actions;
	runPrompts: (bypassArr?: string[]) => Promise<any>;
	runActions: (
		answers: any,
		hooks?: PlopActionHooks
	) => Promise<{
		changes: PlopActionHooksChanges[];
		failures: PlopActionHooksFailures[];
	}>;
}

export type PromptQuestion = inquirer.Question
	| inquirer.CheckboxQuestion
	| inquirer.ListQuestion
	| inquirer.ExpandQuestion
	| inquirer.ConfirmQuestion
	| inquirer.EditorQuestion
	| inquirer.RawListQuestion
	| inquirer.PasswordQuestion
	| inquirer.NumberQuestion
	| inquirer.InputQuestion;

export type DynamicPromptsFunction = (inquirer: inquirer.Inquirer) => Promise<inquirer.Answers>;
export type DynamicActionsFunction = (data?: inquirer.Answers) => ActionType[];

export type Prompts = DynamicPromptsFunction | PromptQuestion[]
export type Actions = DynamicActionsFunction | ActionType[];

export type CustomActionFunction = (
	answers: object,
	config?: ActionConfig,
	plopfileApi?: NodePlopAPI
) => Promise<string> | string; // Check return type?

export type ActionType =
	| ActionConfig
	| AddActionConfig
	| AddManyActionConfig
	| ModifyActionConfig
	| AppendActionConfig
	| CustomActionFunction;

export interface ActionConfig {
	type: string;
	force?: boolean;
	data?: object;
	abortOnFail?: boolean;
}

export interface AddActionConfig extends ActionConfig {
	type: 'add';
	path: string;
	template: string;
	templateFile: string;
	skipIfExists: boolean;
}

export interface AddManyActionConfig extends Pick<AddActionConfig, Exclude<keyof AddActionConfig, 'type'>> {
	type: 'addMany';
	destination: string;
	base: string;
	templateFiles: string;
	globOptions: GlobOptions;
	verbose: boolean;
}

export interface ModifyActionConfig extends ActionConfig {
	type: 'modify';
	path: string;
	pattern: string | RegExp;
	template: string;
	templateFile: string;
}

export interface AppendActionConfig extends ActionConfig {
	type: 'append';
	path: string;
	pattern: string | RegExp;
	unique: boolean;
	separator: string;
	template: string;
	templateFile: string;
}

export interface PlopCfg {
	force: boolean;
	destBasePath: string;
}

declare function nodePlop(plopfilePath: string, plopCfg?: PlopCfg): NodePlopAPI;
export default nodePlop;
