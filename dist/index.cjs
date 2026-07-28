#!/usr/bin/env node
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res, err) => function __init() {
  if (err) throw err[0];
  try {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  } catch (e2) {
    throw err = [e2], e2;
  }
};
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e2) {
    throw mod = 0, e2;
  }
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/commander/lib/error.js
var require_error = __commonJS({
  "node_modules/commander/lib/error.js"(exports2) {
    var CommanderError2 = class extends Error {
      /**
       * Constructs the CommanderError class
       * @param {number} exitCode suggested exit code which could be used with process.exit
       * @param {string} code an id string representing the error
       * @param {string} message human-readable description of the error
       */
      constructor(exitCode, code, message) {
        super(message);
        Error.captureStackTrace(this, this.constructor);
        this.name = this.constructor.name;
        this.code = code;
        this.exitCode = exitCode;
        this.nestedError = void 0;
      }
    };
    var InvalidArgumentError2 = class extends CommanderError2 {
      /**
       * Constructs the InvalidArgumentError class
       * @param {string} [message] explanation of why argument is invalid
       */
      constructor(message) {
        super(1, "commander.invalidArgument", message);
        Error.captureStackTrace(this, this.constructor);
        this.name = this.constructor.name;
      }
    };
    exports2.CommanderError = CommanderError2;
    exports2.InvalidArgumentError = InvalidArgumentError2;
  }
});

// node_modules/commander/lib/argument.js
var require_argument = __commonJS({
  "node_modules/commander/lib/argument.js"(exports2) {
    var { InvalidArgumentError: InvalidArgumentError2 } = require_error();
    var Argument2 = class {
      /**
       * Initialize a new command argument with the given name and description.
       * The default is that the argument is required, and you can explicitly
       * indicate this with <> around the name. Put [] around the name for an optional argument.
       *
       * @param {string} name
       * @param {string} [description]
       */
      constructor(name, description) {
        this.description = description || "";
        this.variadic = false;
        this.parseArg = void 0;
        this.defaultValue = void 0;
        this.defaultValueDescription = void 0;
        this.argChoices = void 0;
        switch (name[0]) {
          case "<":
            this.required = true;
            this._name = name.slice(1, -1);
            break;
          case "[":
            this.required = false;
            this._name = name.slice(1, -1);
            break;
          default:
            this.required = true;
            this._name = name;
            break;
        }
        if (this._name.length > 3 && this._name.slice(-3) === "...") {
          this.variadic = true;
          this._name = this._name.slice(0, -3);
        }
      }
      /**
       * Return argument name.
       *
       * @return {string}
       */
      name() {
        return this._name;
      }
      /**
       * @package
       */
      _concatValue(value, previous) {
        if (previous === this.defaultValue || !Array.isArray(previous)) {
          return [value];
        }
        return previous.concat(value);
      }
      /**
       * Set the default value, and optionally supply the description to be displayed in the help.
       *
       * @param {*} value
       * @param {string} [description]
       * @return {Argument}
       */
      default(value, description) {
        this.defaultValue = value;
        this.defaultValueDescription = description;
        return this;
      }
      /**
       * Set the custom handler for processing CLI command arguments into argument values.
       *
       * @param {Function} [fn]
       * @return {Argument}
       */
      argParser(fn) {
        this.parseArg = fn;
        return this;
      }
      /**
       * Only allow argument value to be one of choices.
       *
       * @param {string[]} values
       * @return {Argument}
       */
      choices(values) {
        this.argChoices = values.slice();
        this.parseArg = (arg, previous) => {
          if (!this.argChoices.includes(arg)) {
            throw new InvalidArgumentError2(
              `Allowed choices are ${this.argChoices.join(", ")}.`
            );
          }
          if (this.variadic) {
            return this._concatValue(arg, previous);
          }
          return arg;
        };
        return this;
      }
      /**
       * Make argument required.
       *
       * @returns {Argument}
       */
      argRequired() {
        this.required = true;
        return this;
      }
      /**
       * Make argument optional.
       *
       * @returns {Argument}
       */
      argOptional() {
        this.required = false;
        return this;
      }
    };
    function humanReadableArgName(arg) {
      const nameOutput = arg.name() + (arg.variadic === true ? "..." : "");
      return arg.required ? "<" + nameOutput + ">" : "[" + nameOutput + "]";
    }
    exports2.Argument = Argument2;
    exports2.humanReadableArgName = humanReadableArgName;
  }
});

// node_modules/commander/lib/help.js
var require_help = __commonJS({
  "node_modules/commander/lib/help.js"(exports2) {
    var { humanReadableArgName } = require_argument();
    var Help2 = class {
      constructor() {
        this.helpWidth = void 0;
        this.sortSubcommands = false;
        this.sortOptions = false;
        this.showGlobalOptions = false;
      }
      /**
       * Get an array of the visible subcommands. Includes a placeholder for the implicit help command, if there is one.
       *
       * @param {Command} cmd
       * @returns {Command[]}
       */
      visibleCommands(cmd) {
        const visibleCommands = cmd.commands.filter((cmd2) => !cmd2._hidden);
        const helpCommand = cmd._getHelpCommand();
        if (helpCommand && !helpCommand._hidden) {
          visibleCommands.push(helpCommand);
        }
        if (this.sortSubcommands) {
          visibleCommands.sort((a3, b3) => {
            return a3.name().localeCompare(b3.name());
          });
        }
        return visibleCommands;
      }
      /**
       * Compare options for sort.
       *
       * @param {Option} a
       * @param {Option} b
       * @returns {number}
       */
      compareOptions(a3, b3) {
        const getSortKey = (option) => {
          return option.short ? option.short.replace(/^-/, "") : option.long.replace(/^--/, "");
        };
        return getSortKey(a3).localeCompare(getSortKey(b3));
      }
      /**
       * Get an array of the visible options. Includes a placeholder for the implicit help option, if there is one.
       *
       * @param {Command} cmd
       * @returns {Option[]}
       */
      visibleOptions(cmd) {
        const visibleOptions = cmd.options.filter((option) => !option.hidden);
        const helpOption = cmd._getHelpOption();
        if (helpOption && !helpOption.hidden) {
          const removeShort = helpOption.short && cmd._findOption(helpOption.short);
          const removeLong = helpOption.long && cmd._findOption(helpOption.long);
          if (!removeShort && !removeLong) {
            visibleOptions.push(helpOption);
          } else if (helpOption.long && !removeLong) {
            visibleOptions.push(
              cmd.createOption(helpOption.long, helpOption.description)
            );
          } else if (helpOption.short && !removeShort) {
            visibleOptions.push(
              cmd.createOption(helpOption.short, helpOption.description)
            );
          }
        }
        if (this.sortOptions) {
          visibleOptions.sort(this.compareOptions);
        }
        return visibleOptions;
      }
      /**
       * Get an array of the visible global options. (Not including help.)
       *
       * @param {Command} cmd
       * @returns {Option[]}
       */
      visibleGlobalOptions(cmd) {
        if (!this.showGlobalOptions) return [];
        const globalOptions = [];
        for (let ancestorCmd = cmd.parent; ancestorCmd; ancestorCmd = ancestorCmd.parent) {
          const visibleOptions = ancestorCmd.options.filter(
            (option) => !option.hidden
          );
          globalOptions.push(...visibleOptions);
        }
        if (this.sortOptions) {
          globalOptions.sort(this.compareOptions);
        }
        return globalOptions;
      }
      /**
       * Get an array of the arguments if any have a description.
       *
       * @param {Command} cmd
       * @returns {Argument[]}
       */
      visibleArguments(cmd) {
        if (cmd._argsDescription) {
          cmd.registeredArguments.forEach((argument) => {
            argument.description = argument.description || cmd._argsDescription[argument.name()] || "";
          });
        }
        if (cmd.registeredArguments.find((argument) => argument.description)) {
          return cmd.registeredArguments;
        }
        return [];
      }
      /**
       * Get the command term to show in the list of subcommands.
       *
       * @param {Command} cmd
       * @returns {string}
       */
      subcommandTerm(cmd) {
        const args = cmd.registeredArguments.map((arg) => humanReadableArgName(arg)).join(" ");
        return cmd._name + (cmd._aliases[0] ? "|" + cmd._aliases[0] : "") + (cmd.options.length ? " [options]" : "") + // simplistic check for non-help option
        (args ? " " + args : "");
      }
      /**
       * Get the option term to show in the list of options.
       *
       * @param {Option} option
       * @returns {string}
       */
      optionTerm(option) {
        return option.flags;
      }
      /**
       * Get the argument term to show in the list of arguments.
       *
       * @param {Argument} argument
       * @returns {string}
       */
      argumentTerm(argument) {
        return argument.name();
      }
      /**
       * Get the longest command term length.
       *
       * @param {Command} cmd
       * @param {Help} helper
       * @returns {number}
       */
      longestSubcommandTermLength(cmd, helper) {
        return helper.visibleCommands(cmd).reduce((max, command) => {
          return Math.max(max, helper.subcommandTerm(command).length);
        }, 0);
      }
      /**
       * Get the longest option term length.
       *
       * @param {Command} cmd
       * @param {Help} helper
       * @returns {number}
       */
      longestOptionTermLength(cmd, helper) {
        return helper.visibleOptions(cmd).reduce((max, option) => {
          return Math.max(max, helper.optionTerm(option).length);
        }, 0);
      }
      /**
       * Get the longest global option term length.
       *
       * @param {Command} cmd
       * @param {Help} helper
       * @returns {number}
       */
      longestGlobalOptionTermLength(cmd, helper) {
        return helper.visibleGlobalOptions(cmd).reduce((max, option) => {
          return Math.max(max, helper.optionTerm(option).length);
        }, 0);
      }
      /**
       * Get the longest argument term length.
       *
       * @param {Command} cmd
       * @param {Help} helper
       * @returns {number}
       */
      longestArgumentTermLength(cmd, helper) {
        return helper.visibleArguments(cmd).reduce((max, argument) => {
          return Math.max(max, helper.argumentTerm(argument).length);
        }, 0);
      }
      /**
       * Get the command usage to be displayed at the top of the built-in help.
       *
       * @param {Command} cmd
       * @returns {string}
       */
      commandUsage(cmd) {
        let cmdName = cmd._name;
        if (cmd._aliases[0]) {
          cmdName = cmdName + "|" + cmd._aliases[0];
        }
        let ancestorCmdNames = "";
        for (let ancestorCmd = cmd.parent; ancestorCmd; ancestorCmd = ancestorCmd.parent) {
          ancestorCmdNames = ancestorCmd.name() + " " + ancestorCmdNames;
        }
        return ancestorCmdNames + cmdName + " " + cmd.usage();
      }
      /**
       * Get the description for the command.
       *
       * @param {Command} cmd
       * @returns {string}
       */
      commandDescription(cmd) {
        return cmd.description();
      }
      /**
       * Get the subcommand summary to show in the list of subcommands.
       * (Fallback to description for backwards compatibility.)
       *
       * @param {Command} cmd
       * @returns {string}
       */
      subcommandDescription(cmd) {
        return cmd.summary() || cmd.description();
      }
      /**
       * Get the option description to show in the list of options.
       *
       * @param {Option} option
       * @return {string}
       */
      optionDescription(option) {
        const extraInfo = [];
        if (option.argChoices) {
          extraInfo.push(
            // use stringify to match the display of the default value
            `choices: ${option.argChoices.map((choice) => JSON.stringify(choice)).join(", ")}`
          );
        }
        if (option.defaultValue !== void 0) {
          const showDefault = option.required || option.optional || option.isBoolean() && typeof option.defaultValue === "boolean";
          if (showDefault) {
            extraInfo.push(
              `default: ${option.defaultValueDescription || JSON.stringify(option.defaultValue)}`
            );
          }
        }
        if (option.presetArg !== void 0 && option.optional) {
          extraInfo.push(`preset: ${JSON.stringify(option.presetArg)}`);
        }
        if (option.envVar !== void 0) {
          extraInfo.push(`env: ${option.envVar}`);
        }
        if (extraInfo.length > 0) {
          return `${option.description} (${extraInfo.join(", ")})`;
        }
        return option.description;
      }
      /**
       * Get the argument description to show in the list of arguments.
       *
       * @param {Argument} argument
       * @return {string}
       */
      argumentDescription(argument) {
        const extraInfo = [];
        if (argument.argChoices) {
          extraInfo.push(
            // use stringify to match the display of the default value
            `choices: ${argument.argChoices.map((choice) => JSON.stringify(choice)).join(", ")}`
          );
        }
        if (argument.defaultValue !== void 0) {
          extraInfo.push(
            `default: ${argument.defaultValueDescription || JSON.stringify(argument.defaultValue)}`
          );
        }
        if (extraInfo.length > 0) {
          const extraDescripton = `(${extraInfo.join(", ")})`;
          if (argument.description) {
            return `${argument.description} ${extraDescripton}`;
          }
          return extraDescripton;
        }
        return argument.description;
      }
      /**
       * Generate the built-in help text.
       *
       * @param {Command} cmd
       * @param {Help} helper
       * @returns {string}
       */
      formatHelp(cmd, helper) {
        const termWidth = helper.padWidth(cmd, helper);
        const helpWidth = helper.helpWidth || 80;
        const itemIndentWidth = 2;
        const itemSeparatorWidth = 2;
        function formatItem(term, description) {
          if (description) {
            const fullText = `${term.padEnd(termWidth + itemSeparatorWidth)}${description}`;
            return helper.wrap(
              fullText,
              helpWidth - itemIndentWidth,
              termWidth + itemSeparatorWidth
            );
          }
          return term;
        }
        function formatList(textArray) {
          return textArray.join("\n").replace(/^/gm, " ".repeat(itemIndentWidth));
        }
        let output = [`Usage: ${helper.commandUsage(cmd)}`, ""];
        const commandDescription = helper.commandDescription(cmd);
        if (commandDescription.length > 0) {
          output = output.concat([
            helper.wrap(commandDescription, helpWidth, 0),
            ""
          ]);
        }
        const argumentList = helper.visibleArguments(cmd).map((argument) => {
          return formatItem(
            helper.argumentTerm(argument),
            helper.argumentDescription(argument)
          );
        });
        if (argumentList.length > 0) {
          output = output.concat(["Arguments:", formatList(argumentList), ""]);
        }
        const optionList = helper.visibleOptions(cmd).map((option) => {
          return formatItem(
            helper.optionTerm(option),
            helper.optionDescription(option)
          );
        });
        if (optionList.length > 0) {
          output = output.concat(["Options:", formatList(optionList), ""]);
        }
        if (this.showGlobalOptions) {
          const globalOptionList = helper.visibleGlobalOptions(cmd).map((option) => {
            return formatItem(
              helper.optionTerm(option),
              helper.optionDescription(option)
            );
          });
          if (globalOptionList.length > 0) {
            output = output.concat([
              "Global Options:",
              formatList(globalOptionList),
              ""
            ]);
          }
        }
        const commandList = helper.visibleCommands(cmd).map((cmd2) => {
          return formatItem(
            helper.subcommandTerm(cmd2),
            helper.subcommandDescription(cmd2)
          );
        });
        if (commandList.length > 0) {
          output = output.concat(["Commands:", formatList(commandList), ""]);
        }
        return output.join("\n");
      }
      /**
       * Calculate the pad width from the maximum term length.
       *
       * @param {Command} cmd
       * @param {Help} helper
       * @returns {number}
       */
      padWidth(cmd, helper) {
        return Math.max(
          helper.longestOptionTermLength(cmd, helper),
          helper.longestGlobalOptionTermLength(cmd, helper),
          helper.longestSubcommandTermLength(cmd, helper),
          helper.longestArgumentTermLength(cmd, helper)
        );
      }
      /**
       * Wrap the given string to width characters per line, with lines after the first indented.
       * Do not wrap if insufficient room for wrapping (minColumnWidth), or string is manually formatted.
       *
       * @param {string} str
       * @param {number} width
       * @param {number} indent
       * @param {number} [minColumnWidth=40]
       * @return {string}
       *
       */
      wrap(str, width, indent, minColumnWidth = 40) {
        const indents = " \\f\\t\\v\xA0\u1680\u2000-\u200A\u202F\u205F\u3000\uFEFF";
        const manualIndent = new RegExp(`[\\n][${indents}]+`);
        if (str.match(manualIndent)) return str;
        const columnWidth = width - indent;
        if (columnWidth < minColumnWidth) return str;
        const leadingStr = str.slice(0, indent);
        const columnText = str.slice(indent).replace("\r\n", "\n");
        const indentString = " ".repeat(indent);
        const zeroWidthSpace = "\u200B";
        const breaks = `\\s${zeroWidthSpace}`;
        const regex = new RegExp(
          `
|.{1,${columnWidth - 1}}([${breaks}]|$)|[^${breaks}]+?([${breaks}]|$)`,
          "g"
        );
        const lines = columnText.match(regex) || [];
        return leadingStr + lines.map((line, i) => {
          if (line === "\n") return "";
          return (i > 0 ? indentString : "") + line.trimEnd();
        }).join("\n");
      }
    };
    exports2.Help = Help2;
  }
});

// node_modules/commander/lib/option.js
var require_option = __commonJS({
  "node_modules/commander/lib/option.js"(exports2) {
    var { InvalidArgumentError: InvalidArgumentError2 } = require_error();
    var Option2 = class {
      /**
       * Initialize a new `Option` with the given `flags` and `description`.
       *
       * @param {string} flags
       * @param {string} [description]
       */
      constructor(flags, description) {
        this.flags = flags;
        this.description = description || "";
        this.required = flags.includes("<");
        this.optional = flags.includes("[");
        this.variadic = /\w\.\.\.[>\]]$/.test(flags);
        this.mandatory = false;
        const optionFlags = splitOptionFlags(flags);
        this.short = optionFlags.shortFlag;
        this.long = optionFlags.longFlag;
        this.negate = false;
        if (this.long) {
          this.negate = this.long.startsWith("--no-");
        }
        this.defaultValue = void 0;
        this.defaultValueDescription = void 0;
        this.presetArg = void 0;
        this.envVar = void 0;
        this.parseArg = void 0;
        this.hidden = false;
        this.argChoices = void 0;
        this.conflictsWith = [];
        this.implied = void 0;
      }
      /**
       * Set the default value, and optionally supply the description to be displayed in the help.
       *
       * @param {*} value
       * @param {string} [description]
       * @return {Option}
       */
      default(value, description) {
        this.defaultValue = value;
        this.defaultValueDescription = description;
        return this;
      }
      /**
       * Preset to use when option used without option-argument, especially optional but also boolean and negated.
       * The custom processing (parseArg) is called.
       *
       * @example
       * new Option('--color').default('GREYSCALE').preset('RGB');
       * new Option('--donate [amount]').preset('20').argParser(parseFloat);
       *
       * @param {*} arg
       * @return {Option}
       */
      preset(arg) {
        this.presetArg = arg;
        return this;
      }
      /**
       * Add option name(s) that conflict with this option.
       * An error will be displayed if conflicting options are found during parsing.
       *
       * @example
       * new Option('--rgb').conflicts('cmyk');
       * new Option('--js').conflicts(['ts', 'jsx']);
       *
       * @param {(string | string[])} names
       * @return {Option}
       */
      conflicts(names) {
        this.conflictsWith = this.conflictsWith.concat(names);
        return this;
      }
      /**
       * Specify implied option values for when this option is set and the implied options are not.
       *
       * The custom processing (parseArg) is not called on the implied values.
       *
       * @example
       * program
       *   .addOption(new Option('--log', 'write logging information to file'))
       *   .addOption(new Option('--trace', 'log extra details').implies({ log: 'trace.txt' }));
       *
       * @param {object} impliedOptionValues
       * @return {Option}
       */
      implies(impliedOptionValues) {
        let newImplied = impliedOptionValues;
        if (typeof impliedOptionValues === "string") {
          newImplied = { [impliedOptionValues]: true };
        }
        this.implied = Object.assign(this.implied || {}, newImplied);
        return this;
      }
      /**
       * Set environment variable to check for option value.
       *
       * An environment variable is only used if when processed the current option value is
       * undefined, or the source of the current value is 'default' or 'config' or 'env'.
       *
       * @param {string} name
       * @return {Option}
       */
      env(name) {
        this.envVar = name;
        return this;
      }
      /**
       * Set the custom handler for processing CLI option arguments into option values.
       *
       * @param {Function} [fn]
       * @return {Option}
       */
      argParser(fn) {
        this.parseArg = fn;
        return this;
      }
      /**
       * Whether the option is mandatory and must have a value after parsing.
       *
       * @param {boolean} [mandatory=true]
       * @return {Option}
       */
      makeOptionMandatory(mandatory = true) {
        this.mandatory = !!mandatory;
        return this;
      }
      /**
       * Hide option in help.
       *
       * @param {boolean} [hide=true]
       * @return {Option}
       */
      hideHelp(hide = true) {
        this.hidden = !!hide;
        return this;
      }
      /**
       * @package
       */
      _concatValue(value, previous) {
        if (previous === this.defaultValue || !Array.isArray(previous)) {
          return [value];
        }
        return previous.concat(value);
      }
      /**
       * Only allow option value to be one of choices.
       *
       * @param {string[]} values
       * @return {Option}
       */
      choices(values) {
        this.argChoices = values.slice();
        this.parseArg = (arg, previous) => {
          if (!this.argChoices.includes(arg)) {
            throw new InvalidArgumentError2(
              `Allowed choices are ${this.argChoices.join(", ")}.`
            );
          }
          if (this.variadic) {
            return this._concatValue(arg, previous);
          }
          return arg;
        };
        return this;
      }
      /**
       * Return option name.
       *
       * @return {string}
       */
      name() {
        if (this.long) {
          return this.long.replace(/^--/, "");
        }
        return this.short.replace(/^-/, "");
      }
      /**
       * Return option name, in a camelcase format that can be used
       * as a object attribute key.
       *
       * @return {string}
       */
      attributeName() {
        return camelcase(this.name().replace(/^no-/, ""));
      }
      /**
       * Check if `arg` matches the short or long flag.
       *
       * @param {string} arg
       * @return {boolean}
       * @package
       */
      is(arg) {
        return this.short === arg || this.long === arg;
      }
      /**
       * Return whether a boolean option.
       *
       * Options are one of boolean, negated, required argument, or optional argument.
       *
       * @return {boolean}
       * @package
       */
      isBoolean() {
        return !this.required && !this.optional && !this.negate;
      }
    };
    var DualOptions = class {
      /**
       * @param {Option[]} options
       */
      constructor(options) {
        this.positiveOptions = /* @__PURE__ */ new Map();
        this.negativeOptions = /* @__PURE__ */ new Map();
        this.dualOptions = /* @__PURE__ */ new Set();
        options.forEach((option) => {
          if (option.negate) {
            this.negativeOptions.set(option.attributeName(), option);
          } else {
            this.positiveOptions.set(option.attributeName(), option);
          }
        });
        this.negativeOptions.forEach((value, key) => {
          if (this.positiveOptions.has(key)) {
            this.dualOptions.add(key);
          }
        });
      }
      /**
       * Did the value come from the option, and not from possible matching dual option?
       *
       * @param {*} value
       * @param {Option} option
       * @returns {boolean}
       */
      valueFromOption(value, option) {
        const optionKey = option.attributeName();
        if (!this.dualOptions.has(optionKey)) return true;
        const preset = this.negativeOptions.get(optionKey).presetArg;
        const negativeValue = preset !== void 0 ? preset : false;
        return option.negate === (negativeValue === value);
      }
    };
    function camelcase(str) {
      return str.split("-").reduce((str2, word) => {
        return str2 + word[0].toUpperCase() + word.slice(1);
      });
    }
    function splitOptionFlags(flags) {
      let shortFlag;
      let longFlag;
      const flagParts = flags.split(/[ |,]+/);
      if (flagParts.length > 1 && !/^[[<]/.test(flagParts[1]))
        shortFlag = flagParts.shift();
      longFlag = flagParts.shift();
      if (!shortFlag && /^-[^-]$/.test(longFlag)) {
        shortFlag = longFlag;
        longFlag = void 0;
      }
      return { shortFlag, longFlag };
    }
    exports2.Option = Option2;
    exports2.DualOptions = DualOptions;
  }
});

// node_modules/commander/lib/suggestSimilar.js
var require_suggestSimilar = __commonJS({
  "node_modules/commander/lib/suggestSimilar.js"(exports2) {
    var maxDistance = 3;
    function editDistance(a3, b3) {
      if (Math.abs(a3.length - b3.length) > maxDistance)
        return Math.max(a3.length, b3.length);
      const d3 = [];
      for (let i = 0; i <= a3.length; i++) {
        d3[i] = [i];
      }
      for (let j2 = 0; j2 <= b3.length; j2++) {
        d3[0][j2] = j2;
      }
      for (let j2 = 1; j2 <= b3.length; j2++) {
        for (let i = 1; i <= a3.length; i++) {
          let cost = 1;
          if (a3[i - 1] === b3[j2 - 1]) {
            cost = 0;
          } else {
            cost = 1;
          }
          d3[i][j2] = Math.min(
            d3[i - 1][j2] + 1,
            // deletion
            d3[i][j2 - 1] + 1,
            // insertion
            d3[i - 1][j2 - 1] + cost
            // substitution
          );
          if (i > 1 && j2 > 1 && a3[i - 1] === b3[j2 - 2] && a3[i - 2] === b3[j2 - 1]) {
            d3[i][j2] = Math.min(d3[i][j2], d3[i - 2][j2 - 2] + 1);
          }
        }
      }
      return d3[a3.length][b3.length];
    }
    function suggestSimilar(word, candidates) {
      if (!candidates || candidates.length === 0) return "";
      candidates = Array.from(new Set(candidates));
      const searchingOptions = word.startsWith("--");
      if (searchingOptions) {
        word = word.slice(2);
        candidates = candidates.map((candidate) => candidate.slice(2));
      }
      let similar = [];
      let bestDistance = maxDistance;
      const minSimilarity = 0.4;
      candidates.forEach((candidate) => {
        if (candidate.length <= 1) return;
        const distance = editDistance(word, candidate);
        const length = Math.max(word.length, candidate.length);
        const similarity = (length - distance) / length;
        if (similarity > minSimilarity) {
          if (distance < bestDistance) {
            bestDistance = distance;
            similar = [candidate];
          } else if (distance === bestDistance) {
            similar.push(candidate);
          }
        }
      });
      similar.sort((a3, b3) => a3.localeCompare(b3));
      if (searchingOptions) {
        similar = similar.map((candidate) => `--${candidate}`);
      }
      if (similar.length > 1) {
        return `
(Did you mean one of ${similar.join(", ")}?)`;
      }
      if (similar.length === 1) {
        return `
(Did you mean ${similar[0]}?)`;
      }
      return "";
    }
    exports2.suggestSimilar = suggestSimilar;
  }
});

// node_modules/commander/lib/command.js
var require_command = __commonJS({
  "node_modules/commander/lib/command.js"(exports2) {
    var EventEmitter = require("node:events").EventEmitter;
    var childProcess = require("node:child_process");
    var path = require("node:path");
    var fs = require("node:fs");
    var process3 = require("node:process");
    var { Argument: Argument2, humanReadableArgName } = require_argument();
    var { CommanderError: CommanderError2 } = require_error();
    var { Help: Help2 } = require_help();
    var { Option: Option2, DualOptions } = require_option();
    var { suggestSimilar } = require_suggestSimilar();
    var Command2 = class _Command extends EventEmitter {
      /**
       * Initialize a new `Command`.
       *
       * @param {string} [name]
       */
      constructor(name) {
        super();
        this.commands = [];
        this.options = [];
        this.parent = null;
        this._allowUnknownOption = false;
        this._allowExcessArguments = true;
        this.registeredArguments = [];
        this._args = this.registeredArguments;
        this.args = [];
        this.rawArgs = [];
        this.processedArgs = [];
        this._scriptPath = null;
        this._name = name || "";
        this._optionValues = {};
        this._optionValueSources = {};
        this._storeOptionsAsProperties = false;
        this._actionHandler = null;
        this._executableHandler = false;
        this._executableFile = null;
        this._executableDir = null;
        this._defaultCommandName = null;
        this._exitCallback = null;
        this._aliases = [];
        this._combineFlagAndOptionalValue = true;
        this._description = "";
        this._summary = "";
        this._argsDescription = void 0;
        this._enablePositionalOptions = false;
        this._passThroughOptions = false;
        this._lifeCycleHooks = {};
        this._showHelpAfterError = false;
        this._showSuggestionAfterError = true;
        this._outputConfiguration = {
          writeOut: (str) => process3.stdout.write(str),
          writeErr: (str) => process3.stderr.write(str),
          getOutHelpWidth: () => process3.stdout.isTTY ? process3.stdout.columns : void 0,
          getErrHelpWidth: () => process3.stderr.isTTY ? process3.stderr.columns : void 0,
          outputError: (str, write) => write(str)
        };
        this._hidden = false;
        this._helpOption = void 0;
        this._addImplicitHelpCommand = void 0;
        this._helpCommand = void 0;
        this._helpConfiguration = {};
      }
      /**
       * Copy settings that are useful to have in common across root command and subcommands.
       *
       * (Used internally when adding a command using `.command()` so subcommands inherit parent settings.)
       *
       * @param {Command} sourceCommand
       * @return {Command} `this` command for chaining
       */
      copyInheritedSettings(sourceCommand) {
        this._outputConfiguration = sourceCommand._outputConfiguration;
        this._helpOption = sourceCommand._helpOption;
        this._helpCommand = sourceCommand._helpCommand;
        this._helpConfiguration = sourceCommand._helpConfiguration;
        this._exitCallback = sourceCommand._exitCallback;
        this._storeOptionsAsProperties = sourceCommand._storeOptionsAsProperties;
        this._combineFlagAndOptionalValue = sourceCommand._combineFlagAndOptionalValue;
        this._allowExcessArguments = sourceCommand._allowExcessArguments;
        this._enablePositionalOptions = sourceCommand._enablePositionalOptions;
        this._showHelpAfterError = sourceCommand._showHelpAfterError;
        this._showSuggestionAfterError = sourceCommand._showSuggestionAfterError;
        return this;
      }
      /**
       * @returns {Command[]}
       * @private
       */
      _getCommandAndAncestors() {
        const result = [];
        for (let command = this; command; command = command.parent) {
          result.push(command);
        }
        return result;
      }
      /**
       * Define a command.
       *
       * There are two styles of command: pay attention to where to put the description.
       *
       * @example
       * // Command implemented using action handler (description is supplied separately to `.command`)
       * program
       *   .command('clone <source> [destination]')
       *   .description('clone a repository into a newly created directory')
       *   .action((source, destination) => {
       *     console.log('clone command called');
       *   });
       *
       * // Command implemented using separate executable file (description is second parameter to `.command`)
       * program
       *   .command('start <service>', 'start named service')
       *   .command('stop [service]', 'stop named service, or all if no name supplied');
       *
       * @param {string} nameAndArgs - command name and arguments, args are `<required>` or `[optional]` and last may also be `variadic...`
       * @param {(object | string)} [actionOptsOrExecDesc] - configuration options (for action), or description (for executable)
       * @param {object} [execOpts] - configuration options (for executable)
       * @return {Command} returns new command for action handler, or `this` for executable command
       */
      command(nameAndArgs, actionOptsOrExecDesc, execOpts) {
        let desc = actionOptsOrExecDesc;
        let opts = execOpts;
        if (typeof desc === "object" && desc !== null) {
          opts = desc;
          desc = null;
        }
        opts = opts || {};
        const [, name, args] = nameAndArgs.match(/([^ ]+) *(.*)/);
        const cmd = this.createCommand(name);
        if (desc) {
          cmd.description(desc);
          cmd._executableHandler = true;
        }
        if (opts.isDefault) this._defaultCommandName = cmd._name;
        cmd._hidden = !!(opts.noHelp || opts.hidden);
        cmd._executableFile = opts.executableFile || null;
        if (args) cmd.arguments(args);
        this._registerCommand(cmd);
        cmd.parent = this;
        cmd.copyInheritedSettings(this);
        if (desc) return this;
        return cmd;
      }
      /**
       * Factory routine to create a new unattached command.
       *
       * See .command() for creating an attached subcommand, which uses this routine to
       * create the command. You can override createCommand to customise subcommands.
       *
       * @param {string} [name]
       * @return {Command} new command
       */
      createCommand(name) {
        return new _Command(name);
      }
      /**
       * You can customise the help with a subclass of Help by overriding createHelp,
       * or by overriding Help properties using configureHelp().
       *
       * @return {Help}
       */
      createHelp() {
        return Object.assign(new Help2(), this.configureHelp());
      }
      /**
       * You can customise the help by overriding Help properties using configureHelp(),
       * or with a subclass of Help by overriding createHelp().
       *
       * @param {object} [configuration] - configuration options
       * @return {(Command | object)} `this` command for chaining, or stored configuration
       */
      configureHelp(configuration) {
        if (configuration === void 0) return this._helpConfiguration;
        this._helpConfiguration = configuration;
        return this;
      }
      /**
       * The default output goes to stdout and stderr. You can customise this for special
       * applications. You can also customise the display of errors by overriding outputError.
       *
       * The configuration properties are all functions:
       *
       *     // functions to change where being written, stdout and stderr
       *     writeOut(str)
       *     writeErr(str)
       *     // matching functions to specify width for wrapping help
       *     getOutHelpWidth()
       *     getErrHelpWidth()
       *     // functions based on what is being written out
       *     outputError(str, write) // used for displaying errors, and not used for displaying help
       *
       * @param {object} [configuration] - configuration options
       * @return {(Command | object)} `this` command for chaining, or stored configuration
       */
      configureOutput(configuration) {
        if (configuration === void 0) return this._outputConfiguration;
        Object.assign(this._outputConfiguration, configuration);
        return this;
      }
      /**
       * Display the help or a custom message after an error occurs.
       *
       * @param {(boolean|string)} [displayHelp]
       * @return {Command} `this` command for chaining
       */
      showHelpAfterError(displayHelp = true) {
        if (typeof displayHelp !== "string") displayHelp = !!displayHelp;
        this._showHelpAfterError = displayHelp;
        return this;
      }
      /**
       * Display suggestion of similar commands for unknown commands, or options for unknown options.
       *
       * @param {boolean} [displaySuggestion]
       * @return {Command} `this` command for chaining
       */
      showSuggestionAfterError(displaySuggestion = true) {
        this._showSuggestionAfterError = !!displaySuggestion;
        return this;
      }
      /**
       * Add a prepared subcommand.
       *
       * See .command() for creating an attached subcommand which inherits settings from its parent.
       *
       * @param {Command} cmd - new subcommand
       * @param {object} [opts] - configuration options
       * @return {Command} `this` command for chaining
       */
      addCommand(cmd, opts) {
        if (!cmd._name) {
          throw new Error(`Command passed to .addCommand() must have a name
- specify the name in Command constructor or using .name()`);
        }
        opts = opts || {};
        if (opts.isDefault) this._defaultCommandName = cmd._name;
        if (opts.noHelp || opts.hidden) cmd._hidden = true;
        this._registerCommand(cmd);
        cmd.parent = this;
        cmd._checkForBrokenPassThrough();
        return this;
      }
      /**
       * Factory routine to create a new unattached argument.
       *
       * See .argument() for creating an attached argument, which uses this routine to
       * create the argument. You can override createArgument to return a custom argument.
       *
       * @param {string} name
       * @param {string} [description]
       * @return {Argument} new argument
       */
      createArgument(name, description) {
        return new Argument2(name, description);
      }
      /**
       * Define argument syntax for command.
       *
       * The default is that the argument is required, and you can explicitly
       * indicate this with <> around the name. Put [] around the name for an optional argument.
       *
       * @example
       * program.argument('<input-file>');
       * program.argument('[output-file]');
       *
       * @param {string} name
       * @param {string} [description]
       * @param {(Function|*)} [fn] - custom argument processing function
       * @param {*} [defaultValue]
       * @return {Command} `this` command for chaining
       */
      argument(name, description, fn, defaultValue) {
        const argument = this.createArgument(name, description);
        if (typeof fn === "function") {
          argument.default(defaultValue).argParser(fn);
        } else {
          argument.default(fn);
        }
        this.addArgument(argument);
        return this;
      }
      /**
       * Define argument syntax for command, adding multiple at once (without descriptions).
       *
       * See also .argument().
       *
       * @example
       * program.arguments('<cmd> [env]');
       *
       * @param {string} names
       * @return {Command} `this` command for chaining
       */
      arguments(names) {
        names.trim().split(/ +/).forEach((detail) => {
          this.argument(detail);
        });
        return this;
      }
      /**
       * Define argument syntax for command, adding a prepared argument.
       *
       * @param {Argument} argument
       * @return {Command} `this` command for chaining
       */
      addArgument(argument) {
        const previousArgument = this.registeredArguments.slice(-1)[0];
        if (previousArgument && previousArgument.variadic) {
          throw new Error(
            `only the last argument can be variadic '${previousArgument.name()}'`
          );
        }
        if (argument.required && argument.defaultValue !== void 0 && argument.parseArg === void 0) {
          throw new Error(
            `a default value for a required argument is never used: '${argument.name()}'`
          );
        }
        this.registeredArguments.push(argument);
        return this;
      }
      /**
       * Customise or override default help command. By default a help command is automatically added if your command has subcommands.
       *
       * @example
       *    program.helpCommand('help [cmd]');
       *    program.helpCommand('help [cmd]', 'show help');
       *    program.helpCommand(false); // suppress default help command
       *    program.helpCommand(true); // add help command even if no subcommands
       *
       * @param {string|boolean} enableOrNameAndArgs - enable with custom name and/or arguments, or boolean to override whether added
       * @param {string} [description] - custom description
       * @return {Command} `this` command for chaining
       */
      helpCommand(enableOrNameAndArgs, description) {
        if (typeof enableOrNameAndArgs === "boolean") {
          this._addImplicitHelpCommand = enableOrNameAndArgs;
          return this;
        }
        enableOrNameAndArgs = enableOrNameAndArgs ?? "help [command]";
        const [, helpName, helpArgs] = enableOrNameAndArgs.match(/([^ ]+) *(.*)/);
        const helpDescription = description ?? "display help for command";
        const helpCommand = this.createCommand(helpName);
        helpCommand.helpOption(false);
        if (helpArgs) helpCommand.arguments(helpArgs);
        if (helpDescription) helpCommand.description(helpDescription);
        this._addImplicitHelpCommand = true;
        this._helpCommand = helpCommand;
        return this;
      }
      /**
       * Add prepared custom help command.
       *
       * @param {(Command|string|boolean)} helpCommand - custom help command, or deprecated enableOrNameAndArgs as for `.helpCommand()`
       * @param {string} [deprecatedDescription] - deprecated custom description used with custom name only
       * @return {Command} `this` command for chaining
       */
      addHelpCommand(helpCommand, deprecatedDescription) {
        if (typeof helpCommand !== "object") {
          this.helpCommand(helpCommand, deprecatedDescription);
          return this;
        }
        this._addImplicitHelpCommand = true;
        this._helpCommand = helpCommand;
        return this;
      }
      /**
       * Lazy create help command.
       *
       * @return {(Command|null)}
       * @package
       */
      _getHelpCommand() {
        const hasImplicitHelpCommand = this._addImplicitHelpCommand ?? (this.commands.length && !this._actionHandler && !this._findCommand("help"));
        if (hasImplicitHelpCommand) {
          if (this._helpCommand === void 0) {
            this.helpCommand(void 0, void 0);
          }
          return this._helpCommand;
        }
        return null;
      }
      /**
       * Add hook for life cycle event.
       *
       * @param {string} event
       * @param {Function} listener
       * @return {Command} `this` command for chaining
       */
      hook(event, listener) {
        const allowedValues = ["preSubcommand", "preAction", "postAction"];
        if (!allowedValues.includes(event)) {
          throw new Error(`Unexpected value for event passed to hook : '${event}'.
Expecting one of '${allowedValues.join("', '")}'`);
        }
        if (this._lifeCycleHooks[event]) {
          this._lifeCycleHooks[event].push(listener);
        } else {
          this._lifeCycleHooks[event] = [listener];
        }
        return this;
      }
      /**
       * Register callback to use as replacement for calling process.exit.
       *
       * @param {Function} [fn] optional callback which will be passed a CommanderError, defaults to throwing
       * @return {Command} `this` command for chaining
       */
      exitOverride(fn) {
        if (fn) {
          this._exitCallback = fn;
        } else {
          this._exitCallback = (err) => {
            if (err.code !== "commander.executeSubCommandAsync") {
              throw err;
            } else {
            }
          };
        }
        return this;
      }
      /**
       * Call process.exit, and _exitCallback if defined.
       *
       * @param {number} exitCode exit code for using with process.exit
       * @param {string} code an id string representing the error
       * @param {string} message human-readable description of the error
       * @return never
       * @private
       */
      _exit(exitCode, code, message) {
        if (this._exitCallback) {
          this._exitCallback(new CommanderError2(exitCode, code, message));
        }
        process3.exit(exitCode);
      }
      /**
       * Register callback `fn` for the command.
       *
       * @example
       * program
       *   .command('serve')
       *   .description('start service')
       *   .action(function() {
       *      // do work here
       *   });
       *
       * @param {Function} fn
       * @return {Command} `this` command for chaining
       */
      action(fn) {
        const listener = (args) => {
          const expectedArgsCount = this.registeredArguments.length;
          const actionArgs = args.slice(0, expectedArgsCount);
          if (this._storeOptionsAsProperties) {
            actionArgs[expectedArgsCount] = this;
          } else {
            actionArgs[expectedArgsCount] = this.opts();
          }
          actionArgs.push(this);
          return fn.apply(this, actionArgs);
        };
        this._actionHandler = listener;
        return this;
      }
      /**
       * Factory routine to create a new unattached option.
       *
       * See .option() for creating an attached option, which uses this routine to
       * create the option. You can override createOption to return a custom option.
       *
       * @param {string} flags
       * @param {string} [description]
       * @return {Option} new option
       */
      createOption(flags, description) {
        return new Option2(flags, description);
      }
      /**
       * Wrap parseArgs to catch 'commander.invalidArgument'.
       *
       * @param {(Option | Argument)} target
       * @param {string} value
       * @param {*} previous
       * @param {string} invalidArgumentMessage
       * @private
       */
      _callParseArg(target, value, previous, invalidArgumentMessage) {
        try {
          return target.parseArg(value, previous);
        } catch (err) {
          if (err.code === "commander.invalidArgument") {
            const message = `${invalidArgumentMessage} ${err.message}`;
            this.error(message, { exitCode: err.exitCode, code: err.code });
          }
          throw err;
        }
      }
      /**
       * Check for option flag conflicts.
       * Register option if no conflicts found, or throw on conflict.
       *
       * @param {Option} option
       * @private
       */
      _registerOption(option) {
        const matchingOption = option.short && this._findOption(option.short) || option.long && this._findOption(option.long);
        if (matchingOption) {
          const matchingFlag = option.long && this._findOption(option.long) ? option.long : option.short;
          throw new Error(`Cannot add option '${option.flags}'${this._name && ` to command '${this._name}'`} due to conflicting flag '${matchingFlag}'
-  already used by option '${matchingOption.flags}'`);
        }
        this.options.push(option);
      }
      /**
       * Check for command name and alias conflicts with existing commands.
       * Register command if no conflicts found, or throw on conflict.
       *
       * @param {Command} command
       * @private
       */
      _registerCommand(command) {
        const knownBy = (cmd) => {
          return [cmd.name()].concat(cmd.aliases());
        };
        const alreadyUsed = knownBy(command).find(
          (name) => this._findCommand(name)
        );
        if (alreadyUsed) {
          const existingCmd = knownBy(this._findCommand(alreadyUsed)).join("|");
          const newCmd = knownBy(command).join("|");
          throw new Error(
            `cannot add command '${newCmd}' as already have command '${existingCmd}'`
          );
        }
        this.commands.push(command);
      }
      /**
       * Add an option.
       *
       * @param {Option} option
       * @return {Command} `this` command for chaining
       */
      addOption(option) {
        this._registerOption(option);
        const oname = option.name();
        const name = option.attributeName();
        if (option.negate) {
          const positiveLongFlag = option.long.replace(/^--no-/, "--");
          if (!this._findOption(positiveLongFlag)) {
            this.setOptionValueWithSource(
              name,
              option.defaultValue === void 0 ? true : option.defaultValue,
              "default"
            );
          }
        } else if (option.defaultValue !== void 0) {
          this.setOptionValueWithSource(name, option.defaultValue, "default");
        }
        const handleOptionValue = (val, invalidValueMessage, valueSource) => {
          if (val == null && option.presetArg !== void 0) {
            val = option.presetArg;
          }
          const oldValue = this.getOptionValue(name);
          if (val !== null && option.parseArg) {
            val = this._callParseArg(option, val, oldValue, invalidValueMessage);
          } else if (val !== null && option.variadic) {
            val = option._concatValue(val, oldValue);
          }
          if (val == null) {
            if (option.negate) {
              val = false;
            } else if (option.isBoolean() || option.optional) {
              val = true;
            } else {
              val = "";
            }
          }
          this.setOptionValueWithSource(name, val, valueSource);
        };
        this.on("option:" + oname, (val) => {
          const invalidValueMessage = `error: option '${option.flags}' argument '${val}' is invalid.`;
          handleOptionValue(val, invalidValueMessage, "cli");
        });
        if (option.envVar) {
          this.on("optionEnv:" + oname, (val) => {
            const invalidValueMessage = `error: option '${option.flags}' value '${val}' from env '${option.envVar}' is invalid.`;
            handleOptionValue(val, invalidValueMessage, "env");
          });
        }
        return this;
      }
      /**
       * Internal implementation shared by .option() and .requiredOption()
       *
       * @return {Command} `this` command for chaining
       * @private
       */
      _optionEx(config, flags, description, fn, defaultValue) {
        if (typeof flags === "object" && flags instanceof Option2) {
          throw new Error(
            "To add an Option object use addOption() instead of option() or requiredOption()"
          );
        }
        const option = this.createOption(flags, description);
        option.makeOptionMandatory(!!config.mandatory);
        if (typeof fn === "function") {
          option.default(defaultValue).argParser(fn);
        } else if (fn instanceof RegExp) {
          const regex = fn;
          fn = (val, def) => {
            const m2 = regex.exec(val);
            return m2 ? m2[0] : def;
          };
          option.default(defaultValue).argParser(fn);
        } else {
          option.default(fn);
        }
        return this.addOption(option);
      }
      /**
       * Define option with `flags`, `description`, and optional argument parsing function or `defaultValue` or both.
       *
       * The `flags` string contains the short and/or long flags, separated by comma, a pipe or space. A required
       * option-argument is indicated by `<>` and an optional option-argument by `[]`.
       *
       * See the README for more details, and see also addOption() and requiredOption().
       *
       * @example
       * program
       *     .option('-p, --pepper', 'add pepper')
       *     .option('-p, --pizza-type <TYPE>', 'type of pizza') // required option-argument
       *     .option('-c, --cheese [CHEESE]', 'add extra cheese', 'mozzarella') // optional option-argument with default
       *     .option('-t, --tip <VALUE>', 'add tip to purchase cost', parseFloat) // custom parse function
       *
       * @param {string} flags
       * @param {string} [description]
       * @param {(Function|*)} [parseArg] - custom option processing function or default value
       * @param {*} [defaultValue]
       * @return {Command} `this` command for chaining
       */
      option(flags, description, parseArg, defaultValue) {
        return this._optionEx({}, flags, description, parseArg, defaultValue);
      }
      /**
       * Add a required option which must have a value after parsing. This usually means
       * the option must be specified on the command line. (Otherwise the same as .option().)
       *
       * The `flags` string contains the short and/or long flags, separated by comma, a pipe or space.
       *
       * @param {string} flags
       * @param {string} [description]
       * @param {(Function|*)} [parseArg] - custom option processing function or default value
       * @param {*} [defaultValue]
       * @return {Command} `this` command for chaining
       */
      requiredOption(flags, description, parseArg, defaultValue) {
        return this._optionEx(
          { mandatory: true },
          flags,
          description,
          parseArg,
          defaultValue
        );
      }
      /**
       * Alter parsing of short flags with optional values.
       *
       * @example
       * // for `.option('-f,--flag [value]'):
       * program.combineFlagAndOptionalValue(true);  // `-f80` is treated like `--flag=80`, this is the default behaviour
       * program.combineFlagAndOptionalValue(false) // `-fb` is treated like `-f -b`
       *
       * @param {boolean} [combine] - if `true` or omitted, an optional value can be specified directly after the flag.
       * @return {Command} `this` command for chaining
       */
      combineFlagAndOptionalValue(combine = true) {
        this._combineFlagAndOptionalValue = !!combine;
        return this;
      }
      /**
       * Allow unknown options on the command line.
       *
       * @param {boolean} [allowUnknown] - if `true` or omitted, no error will be thrown for unknown options.
       * @return {Command} `this` command for chaining
       */
      allowUnknownOption(allowUnknown = true) {
        this._allowUnknownOption = !!allowUnknown;
        return this;
      }
      /**
       * Allow excess command-arguments on the command line. Pass false to make excess arguments an error.
       *
       * @param {boolean} [allowExcess] - if `true` or omitted, no error will be thrown for excess arguments.
       * @return {Command} `this` command for chaining
       */
      allowExcessArguments(allowExcess = true) {
        this._allowExcessArguments = !!allowExcess;
        return this;
      }
      /**
       * Enable positional options. Positional means global options are specified before subcommands which lets
       * subcommands reuse the same option names, and also enables subcommands to turn on passThroughOptions.
       * The default behaviour is non-positional and global options may appear anywhere on the command line.
       *
       * @param {boolean} [positional]
       * @return {Command} `this` command for chaining
       */
      enablePositionalOptions(positional = true) {
        this._enablePositionalOptions = !!positional;
        return this;
      }
      /**
       * Pass through options that come after command-arguments rather than treat them as command-options,
       * so actual command-options come before command-arguments. Turning this on for a subcommand requires
       * positional options to have been enabled on the program (parent commands).
       * The default behaviour is non-positional and options may appear before or after command-arguments.
       *
       * @param {boolean} [passThrough] for unknown options.
       * @return {Command} `this` command for chaining
       */
      passThroughOptions(passThrough = true) {
        this._passThroughOptions = !!passThrough;
        this._checkForBrokenPassThrough();
        return this;
      }
      /**
       * @private
       */
      _checkForBrokenPassThrough() {
        if (this.parent && this._passThroughOptions && !this.parent._enablePositionalOptions) {
          throw new Error(
            `passThroughOptions cannot be used for '${this._name}' without turning on enablePositionalOptions for parent command(s)`
          );
        }
      }
      /**
       * Whether to store option values as properties on command object,
       * or store separately (specify false). In both cases the option values can be accessed using .opts().
       *
       * @param {boolean} [storeAsProperties=true]
       * @return {Command} `this` command for chaining
       */
      storeOptionsAsProperties(storeAsProperties = true) {
        if (this.options.length) {
          throw new Error("call .storeOptionsAsProperties() before adding options");
        }
        if (Object.keys(this._optionValues).length) {
          throw new Error(
            "call .storeOptionsAsProperties() before setting option values"
          );
        }
        this._storeOptionsAsProperties = !!storeAsProperties;
        return this;
      }
      /**
       * Retrieve option value.
       *
       * @param {string} key
       * @return {object} value
       */
      getOptionValue(key) {
        if (this._storeOptionsAsProperties) {
          return this[key];
        }
        return this._optionValues[key];
      }
      /**
       * Store option value.
       *
       * @param {string} key
       * @param {object} value
       * @return {Command} `this` command for chaining
       */
      setOptionValue(key, value) {
        return this.setOptionValueWithSource(key, value, void 0);
      }
      /**
       * Store option value and where the value came from.
       *
       * @param {string} key
       * @param {object} value
       * @param {string} source - expected values are default/config/env/cli/implied
       * @return {Command} `this` command for chaining
       */
      setOptionValueWithSource(key, value, source) {
        if (this._storeOptionsAsProperties) {
          this[key] = value;
        } else {
          this._optionValues[key] = value;
        }
        this._optionValueSources[key] = source;
        return this;
      }
      /**
       * Get source of option value.
       * Expected values are default | config | env | cli | implied
       *
       * @param {string} key
       * @return {string}
       */
      getOptionValueSource(key) {
        return this._optionValueSources[key];
      }
      /**
       * Get source of option value. See also .optsWithGlobals().
       * Expected values are default | config | env | cli | implied
       *
       * @param {string} key
       * @return {string}
       */
      getOptionValueSourceWithGlobals(key) {
        let source;
        this._getCommandAndAncestors().forEach((cmd) => {
          if (cmd.getOptionValueSource(key) !== void 0) {
            source = cmd.getOptionValueSource(key);
          }
        });
        return source;
      }
      /**
       * Get user arguments from implied or explicit arguments.
       * Side-effects: set _scriptPath if args included script. Used for default program name, and subcommand searches.
       *
       * @private
       */
      _prepareUserArgs(argv, parseOptions) {
        if (argv !== void 0 && !Array.isArray(argv)) {
          throw new Error("first parameter to parse must be array or undefined");
        }
        parseOptions = parseOptions || {};
        if (argv === void 0 && parseOptions.from === void 0) {
          if (process3.versions?.electron) {
            parseOptions.from = "electron";
          }
          const execArgv = process3.execArgv ?? [];
          if (execArgv.includes("-e") || execArgv.includes("--eval") || execArgv.includes("-p") || execArgv.includes("--print")) {
            parseOptions.from = "eval";
          }
        }
        if (argv === void 0) {
          argv = process3.argv;
        }
        this.rawArgs = argv.slice();
        let userArgs;
        switch (parseOptions.from) {
          case void 0:
          case "node":
            this._scriptPath = argv[1];
            userArgs = argv.slice(2);
            break;
          case "electron":
            if (process3.defaultApp) {
              this._scriptPath = argv[1];
              userArgs = argv.slice(2);
            } else {
              userArgs = argv.slice(1);
            }
            break;
          case "user":
            userArgs = argv.slice(0);
            break;
          case "eval":
            userArgs = argv.slice(1);
            break;
          default:
            throw new Error(
              `unexpected parse option { from: '${parseOptions.from}' }`
            );
        }
        if (!this._name && this._scriptPath)
          this.nameFromFilename(this._scriptPath);
        this._name = this._name || "program";
        return userArgs;
      }
      /**
       * Parse `argv`, setting options and invoking commands when defined.
       *
       * Use parseAsync instead of parse if any of your action handlers are async.
       *
       * Call with no parameters to parse `process.argv`. Detects Electron and special node options like `node --eval`. Easy mode!
       *
       * Or call with an array of strings to parse, and optionally where the user arguments start by specifying where the arguments are `from`:
       * - `'node'`: default, `argv[0]` is the application and `argv[1]` is the script being run, with user arguments after that
       * - `'electron'`: `argv[0]` is the application and `argv[1]` varies depending on whether the electron application is packaged
       * - `'user'`: just user arguments
       *
       * @example
       * program.parse(); // parse process.argv and auto-detect electron and special node flags
       * program.parse(process.argv); // assume argv[0] is app and argv[1] is script
       * program.parse(my-args, { from: 'user' }); // just user supplied arguments, nothing special about argv[0]
       *
       * @param {string[]} [argv] - optional, defaults to process.argv
       * @param {object} [parseOptions] - optionally specify style of options with from: node/user/electron
       * @param {string} [parseOptions.from] - where the args are from: 'node', 'user', 'electron'
       * @return {Command} `this` command for chaining
       */
      parse(argv, parseOptions) {
        const userArgs = this._prepareUserArgs(argv, parseOptions);
        this._parseCommand([], userArgs);
        return this;
      }
      /**
       * Parse `argv`, setting options and invoking commands when defined.
       *
       * Call with no parameters to parse `process.argv`. Detects Electron and special node options like `node --eval`. Easy mode!
       *
       * Or call with an array of strings to parse, and optionally where the user arguments start by specifying where the arguments are `from`:
       * - `'node'`: default, `argv[0]` is the application and `argv[1]` is the script being run, with user arguments after that
       * - `'electron'`: `argv[0]` is the application and `argv[1]` varies depending on whether the electron application is packaged
       * - `'user'`: just user arguments
       *
       * @example
       * await program.parseAsync(); // parse process.argv and auto-detect electron and special node flags
       * await program.parseAsync(process.argv); // assume argv[0] is app and argv[1] is script
       * await program.parseAsync(my-args, { from: 'user' }); // just user supplied arguments, nothing special about argv[0]
       *
       * @param {string[]} [argv]
       * @param {object} [parseOptions]
       * @param {string} parseOptions.from - where the args are from: 'node', 'user', 'electron'
       * @return {Promise}
       */
      async parseAsync(argv, parseOptions) {
        const userArgs = this._prepareUserArgs(argv, parseOptions);
        await this._parseCommand([], userArgs);
        return this;
      }
      /**
       * Execute a sub-command executable.
       *
       * @private
       */
      _executeSubCommand(subcommand, args) {
        args = args.slice();
        let launchWithNode = false;
        const sourceExt = [".js", ".ts", ".tsx", ".mjs", ".cjs"];
        function findFile(baseDir, baseName) {
          const localBin = path.resolve(baseDir, baseName);
          if (fs.existsSync(localBin)) return localBin;
          if (sourceExt.includes(path.extname(baseName))) return void 0;
          const foundExt = sourceExt.find(
            (ext) => fs.existsSync(`${localBin}${ext}`)
          );
          if (foundExt) return `${localBin}${foundExt}`;
          return void 0;
        }
        this._checkForMissingMandatoryOptions();
        this._checkForConflictingOptions();
        let executableFile = subcommand._executableFile || `${this._name}-${subcommand._name}`;
        let executableDir = this._executableDir || "";
        if (this._scriptPath) {
          let resolvedScriptPath;
          try {
            resolvedScriptPath = fs.realpathSync(this._scriptPath);
          } catch (err) {
            resolvedScriptPath = this._scriptPath;
          }
          executableDir = path.resolve(
            path.dirname(resolvedScriptPath),
            executableDir
          );
        }
        if (executableDir) {
          let localFile = findFile(executableDir, executableFile);
          if (!localFile && !subcommand._executableFile && this._scriptPath) {
            const legacyName = path.basename(
              this._scriptPath,
              path.extname(this._scriptPath)
            );
            if (legacyName !== this._name) {
              localFile = findFile(
                executableDir,
                `${legacyName}-${subcommand._name}`
              );
            }
          }
          executableFile = localFile || executableFile;
        }
        launchWithNode = sourceExt.includes(path.extname(executableFile));
        let proc;
        if (process3.platform !== "win32") {
          if (launchWithNode) {
            args.unshift(executableFile);
            args = incrementNodeInspectorPort(process3.execArgv).concat(args);
            proc = childProcess.spawn(process3.argv[0], args, { stdio: "inherit" });
          } else {
            proc = childProcess.spawn(executableFile, args, { stdio: "inherit" });
          }
        } else {
          args.unshift(executableFile);
          args = incrementNodeInspectorPort(process3.execArgv).concat(args);
          proc = childProcess.spawn(process3.execPath, args, { stdio: "inherit" });
        }
        if (!proc.killed) {
          const signals = ["SIGUSR1", "SIGUSR2", "SIGTERM", "SIGINT", "SIGHUP"];
          signals.forEach((signal) => {
            process3.on(signal, () => {
              if (proc.killed === false && proc.exitCode === null) {
                proc.kill(signal);
              }
            });
          });
        }
        const exitCallback = this._exitCallback;
        proc.on("close", (code) => {
          code = code ?? 1;
          if (!exitCallback) {
            process3.exit(code);
          } else {
            exitCallback(
              new CommanderError2(
                code,
                "commander.executeSubCommandAsync",
                "(close)"
              )
            );
          }
        });
        proc.on("error", (err) => {
          if (err.code === "ENOENT") {
            const executableDirMessage = executableDir ? `searched for local subcommand relative to directory '${executableDir}'` : "no directory for search for local subcommand, use .executableDir() to supply a custom directory";
            const executableMissing = `'${executableFile}' does not exist
 - if '${subcommand._name}' is not meant to be an executable command, remove description parameter from '.command()' and use '.description()' instead
 - if the default executable name is not suitable, use the executableFile option to supply a custom name or path
 - ${executableDirMessage}`;
            throw new Error(executableMissing);
          } else if (err.code === "EACCES") {
            throw new Error(`'${executableFile}' not executable`);
          }
          if (!exitCallback) {
            process3.exit(1);
          } else {
            const wrappedError = new CommanderError2(
              1,
              "commander.executeSubCommandAsync",
              "(error)"
            );
            wrappedError.nestedError = err;
            exitCallback(wrappedError);
          }
        });
        this.runningCommand = proc;
      }
      /**
       * @private
       */
      _dispatchSubcommand(commandName, operands, unknown) {
        const subCommand = this._findCommand(commandName);
        if (!subCommand) this.help({ error: true });
        let promiseChain;
        promiseChain = this._chainOrCallSubCommandHook(
          promiseChain,
          subCommand,
          "preSubcommand"
        );
        promiseChain = this._chainOrCall(promiseChain, () => {
          if (subCommand._executableHandler) {
            this._executeSubCommand(subCommand, operands.concat(unknown));
          } else {
            return subCommand._parseCommand(operands, unknown);
          }
        });
        return promiseChain;
      }
      /**
       * Invoke help directly if possible, or dispatch if necessary.
       * e.g. help foo
       *
       * @private
       */
      _dispatchHelpCommand(subcommandName) {
        if (!subcommandName) {
          this.help();
        }
        const subCommand = this._findCommand(subcommandName);
        if (subCommand && !subCommand._executableHandler) {
          subCommand.help();
        }
        return this._dispatchSubcommand(
          subcommandName,
          [],
          [this._getHelpOption()?.long ?? this._getHelpOption()?.short ?? "--help"]
        );
      }
      /**
       * Check this.args against expected this.registeredArguments.
       *
       * @private
       */
      _checkNumberOfArguments() {
        this.registeredArguments.forEach((arg, i) => {
          if (arg.required && this.args[i] == null) {
            this.missingArgument(arg.name());
          }
        });
        if (this.registeredArguments.length > 0 && this.registeredArguments[this.registeredArguments.length - 1].variadic) {
          return;
        }
        if (this.args.length > this.registeredArguments.length) {
          this._excessArguments(this.args);
        }
      }
      /**
       * Process this.args using this.registeredArguments and save as this.processedArgs!
       *
       * @private
       */
      _processArguments() {
        const myParseArg = (argument, value, previous) => {
          let parsedValue = value;
          if (value !== null && argument.parseArg) {
            const invalidValueMessage = `error: command-argument value '${value}' is invalid for argument '${argument.name()}'.`;
            parsedValue = this._callParseArg(
              argument,
              value,
              previous,
              invalidValueMessage
            );
          }
          return parsedValue;
        };
        this._checkNumberOfArguments();
        const processedArgs = [];
        this.registeredArguments.forEach((declaredArg, index) => {
          let value = declaredArg.defaultValue;
          if (declaredArg.variadic) {
            if (index < this.args.length) {
              value = this.args.slice(index);
              if (declaredArg.parseArg) {
                value = value.reduce((processed, v2) => {
                  return myParseArg(declaredArg, v2, processed);
                }, declaredArg.defaultValue);
              }
            } else if (value === void 0) {
              value = [];
            }
          } else if (index < this.args.length) {
            value = this.args[index];
            if (declaredArg.parseArg) {
              value = myParseArg(declaredArg, value, declaredArg.defaultValue);
            }
          }
          processedArgs[index] = value;
        });
        this.processedArgs = processedArgs;
      }
      /**
       * Once we have a promise we chain, but call synchronously until then.
       *
       * @param {(Promise|undefined)} promise
       * @param {Function} fn
       * @return {(Promise|undefined)}
       * @private
       */
      _chainOrCall(promise, fn) {
        if (promise && promise.then && typeof promise.then === "function") {
          return promise.then(() => fn());
        }
        return fn();
      }
      /**
       *
       * @param {(Promise|undefined)} promise
       * @param {string} event
       * @return {(Promise|undefined)}
       * @private
       */
      _chainOrCallHooks(promise, event) {
        let result = promise;
        const hooks = [];
        this._getCommandAndAncestors().reverse().filter((cmd) => cmd._lifeCycleHooks[event] !== void 0).forEach((hookedCommand) => {
          hookedCommand._lifeCycleHooks[event].forEach((callback) => {
            hooks.push({ hookedCommand, callback });
          });
        });
        if (event === "postAction") {
          hooks.reverse();
        }
        hooks.forEach((hookDetail) => {
          result = this._chainOrCall(result, () => {
            return hookDetail.callback(hookDetail.hookedCommand, this);
          });
        });
        return result;
      }
      /**
       *
       * @param {(Promise|undefined)} promise
       * @param {Command} subCommand
       * @param {string} event
       * @return {(Promise|undefined)}
       * @private
       */
      _chainOrCallSubCommandHook(promise, subCommand, event) {
        let result = promise;
        if (this._lifeCycleHooks[event] !== void 0) {
          this._lifeCycleHooks[event].forEach((hook) => {
            result = this._chainOrCall(result, () => {
              return hook(this, subCommand);
            });
          });
        }
        return result;
      }
      /**
       * Process arguments in context of this command.
       * Returns action result, in case it is a promise.
       *
       * @private
       */
      _parseCommand(operands, unknown) {
        const parsed = this.parseOptions(unknown);
        this._parseOptionsEnv();
        this._parseOptionsImplied();
        operands = operands.concat(parsed.operands);
        unknown = parsed.unknown;
        this.args = operands.concat(unknown);
        if (operands && this._findCommand(operands[0])) {
          return this._dispatchSubcommand(operands[0], operands.slice(1), unknown);
        }
        if (this._getHelpCommand() && operands[0] === this._getHelpCommand().name()) {
          return this._dispatchHelpCommand(operands[1]);
        }
        if (this._defaultCommandName) {
          this._outputHelpIfRequested(unknown);
          return this._dispatchSubcommand(
            this._defaultCommandName,
            operands,
            unknown
          );
        }
        if (this.commands.length && this.args.length === 0 && !this._actionHandler && !this._defaultCommandName) {
          this.help({ error: true });
        }
        this._outputHelpIfRequested(parsed.unknown);
        this._checkForMissingMandatoryOptions();
        this._checkForConflictingOptions();
        const checkForUnknownOptions = () => {
          if (parsed.unknown.length > 0) {
            this.unknownOption(parsed.unknown[0]);
          }
        };
        const commandEvent = `command:${this.name()}`;
        if (this._actionHandler) {
          checkForUnknownOptions();
          this._processArguments();
          let promiseChain;
          promiseChain = this._chainOrCallHooks(promiseChain, "preAction");
          promiseChain = this._chainOrCall(
            promiseChain,
            () => this._actionHandler(this.processedArgs)
          );
          if (this.parent) {
            promiseChain = this._chainOrCall(promiseChain, () => {
              this.parent.emit(commandEvent, operands, unknown);
            });
          }
          promiseChain = this._chainOrCallHooks(promiseChain, "postAction");
          return promiseChain;
        }
        if (this.parent && this.parent.listenerCount(commandEvent)) {
          checkForUnknownOptions();
          this._processArguments();
          this.parent.emit(commandEvent, operands, unknown);
        } else if (operands.length) {
          if (this._findCommand("*")) {
            return this._dispatchSubcommand("*", operands, unknown);
          }
          if (this.listenerCount("command:*")) {
            this.emit("command:*", operands, unknown);
          } else if (this.commands.length) {
            this.unknownCommand();
          } else {
            checkForUnknownOptions();
            this._processArguments();
          }
        } else if (this.commands.length) {
          checkForUnknownOptions();
          this.help({ error: true });
        } else {
          checkForUnknownOptions();
          this._processArguments();
        }
      }
      /**
       * Find matching command.
       *
       * @private
       * @return {Command | undefined}
       */
      _findCommand(name) {
        if (!name) return void 0;
        return this.commands.find(
          (cmd) => cmd._name === name || cmd._aliases.includes(name)
        );
      }
      /**
       * Return an option matching `arg` if any.
       *
       * @param {string} arg
       * @return {Option}
       * @package
       */
      _findOption(arg) {
        return this.options.find((option) => option.is(arg));
      }
      /**
       * Display an error message if a mandatory option does not have a value.
       * Called after checking for help flags in leaf subcommand.
       *
       * @private
       */
      _checkForMissingMandatoryOptions() {
        this._getCommandAndAncestors().forEach((cmd) => {
          cmd.options.forEach((anOption) => {
            if (anOption.mandatory && cmd.getOptionValue(anOption.attributeName()) === void 0) {
              cmd.missingMandatoryOptionValue(anOption);
            }
          });
        });
      }
      /**
       * Display an error message if conflicting options are used together in this.
       *
       * @private
       */
      _checkForConflictingLocalOptions() {
        const definedNonDefaultOptions = this.options.filter((option) => {
          const optionKey = option.attributeName();
          if (this.getOptionValue(optionKey) === void 0) {
            return false;
          }
          return this.getOptionValueSource(optionKey) !== "default";
        });
        const optionsWithConflicting = definedNonDefaultOptions.filter(
          (option) => option.conflictsWith.length > 0
        );
        optionsWithConflicting.forEach((option) => {
          const conflictingAndDefined = definedNonDefaultOptions.find(
            (defined) => option.conflictsWith.includes(defined.attributeName())
          );
          if (conflictingAndDefined) {
            this._conflictingOption(option, conflictingAndDefined);
          }
        });
      }
      /**
       * Display an error message if conflicting options are used together.
       * Called after checking for help flags in leaf subcommand.
       *
       * @private
       */
      _checkForConflictingOptions() {
        this._getCommandAndAncestors().forEach((cmd) => {
          cmd._checkForConflictingLocalOptions();
        });
      }
      /**
       * Parse options from `argv` removing known options,
       * and return argv split into operands and unknown arguments.
       *
       * Examples:
       *
       *     argv => operands, unknown
       *     --known kkk op => [op], []
       *     op --known kkk => [op], []
       *     sub --unknown uuu op => [sub], [--unknown uuu op]
       *     sub -- --unknown uuu op => [sub --unknown uuu op], []
       *
       * @param {string[]} argv
       * @return {{operands: string[], unknown: string[]}}
       */
      parseOptions(argv) {
        const operands = [];
        const unknown = [];
        let dest = operands;
        const args = argv.slice();
        function maybeOption(arg) {
          return arg.length > 1 && arg[0] === "-";
        }
        let activeVariadicOption = null;
        while (args.length) {
          const arg = args.shift();
          if (arg === "--") {
            if (dest === unknown) dest.push(arg);
            dest.push(...args);
            break;
          }
          if (activeVariadicOption && !maybeOption(arg)) {
            this.emit(`option:${activeVariadicOption.name()}`, arg);
            continue;
          }
          activeVariadicOption = null;
          if (maybeOption(arg)) {
            const option = this._findOption(arg);
            if (option) {
              if (option.required) {
                const value = args.shift();
                if (value === void 0) this.optionMissingArgument(option);
                this.emit(`option:${option.name()}`, value);
              } else if (option.optional) {
                let value = null;
                if (args.length > 0 && !maybeOption(args[0])) {
                  value = args.shift();
                }
                this.emit(`option:${option.name()}`, value);
              } else {
                this.emit(`option:${option.name()}`);
              }
              activeVariadicOption = option.variadic ? option : null;
              continue;
            }
          }
          if (arg.length > 2 && arg[0] === "-" && arg[1] !== "-") {
            const option = this._findOption(`-${arg[1]}`);
            if (option) {
              if (option.required || option.optional && this._combineFlagAndOptionalValue) {
                this.emit(`option:${option.name()}`, arg.slice(2));
              } else {
                this.emit(`option:${option.name()}`);
                args.unshift(`-${arg.slice(2)}`);
              }
              continue;
            }
          }
          if (/^--[^=]+=/.test(arg)) {
            const index = arg.indexOf("=");
            const option = this._findOption(arg.slice(0, index));
            if (option && (option.required || option.optional)) {
              this.emit(`option:${option.name()}`, arg.slice(index + 1));
              continue;
            }
          }
          if (maybeOption(arg)) {
            dest = unknown;
          }
          if ((this._enablePositionalOptions || this._passThroughOptions) && operands.length === 0 && unknown.length === 0) {
            if (this._findCommand(arg)) {
              operands.push(arg);
              if (args.length > 0) unknown.push(...args);
              break;
            } else if (this._getHelpCommand() && arg === this._getHelpCommand().name()) {
              operands.push(arg);
              if (args.length > 0) operands.push(...args);
              break;
            } else if (this._defaultCommandName) {
              unknown.push(arg);
              if (args.length > 0) unknown.push(...args);
              break;
            }
          }
          if (this._passThroughOptions) {
            dest.push(arg);
            if (args.length > 0) dest.push(...args);
            break;
          }
          dest.push(arg);
        }
        return { operands, unknown };
      }
      /**
       * Return an object containing local option values as key-value pairs.
       *
       * @return {object}
       */
      opts() {
        if (this._storeOptionsAsProperties) {
          const result = {};
          const len = this.options.length;
          for (let i = 0; i < len; i++) {
            const key = this.options[i].attributeName();
            result[key] = key === this._versionOptionName ? this._version : this[key];
          }
          return result;
        }
        return this._optionValues;
      }
      /**
       * Return an object containing merged local and global option values as key-value pairs.
       *
       * @return {object}
       */
      optsWithGlobals() {
        return this._getCommandAndAncestors().reduce(
          (combinedOptions, cmd) => Object.assign(combinedOptions, cmd.opts()),
          {}
        );
      }
      /**
       * Display error message and exit (or call exitOverride).
       *
       * @param {string} message
       * @param {object} [errorOptions]
       * @param {string} [errorOptions.code] - an id string representing the error
       * @param {number} [errorOptions.exitCode] - used with process.exit
       */
      error(message, errorOptions) {
        this._outputConfiguration.outputError(
          `${message}
`,
          this._outputConfiguration.writeErr
        );
        if (typeof this._showHelpAfterError === "string") {
          this._outputConfiguration.writeErr(`${this._showHelpAfterError}
`);
        } else if (this._showHelpAfterError) {
          this._outputConfiguration.writeErr("\n");
          this.outputHelp({ error: true });
        }
        const config = errorOptions || {};
        const exitCode = config.exitCode || 1;
        const code = config.code || "commander.error";
        this._exit(exitCode, code, message);
      }
      /**
       * Apply any option related environment variables, if option does
       * not have a value from cli or client code.
       *
       * @private
       */
      _parseOptionsEnv() {
        this.options.forEach((option) => {
          if (option.envVar && option.envVar in process3.env) {
            const optionKey = option.attributeName();
            if (this.getOptionValue(optionKey) === void 0 || ["default", "config", "env"].includes(
              this.getOptionValueSource(optionKey)
            )) {
              if (option.required || option.optional) {
                this.emit(`optionEnv:${option.name()}`, process3.env[option.envVar]);
              } else {
                this.emit(`optionEnv:${option.name()}`);
              }
            }
          }
        });
      }
      /**
       * Apply any implied option values, if option is undefined or default value.
       *
       * @private
       */
      _parseOptionsImplied() {
        const dualHelper = new DualOptions(this.options);
        const hasCustomOptionValue = (optionKey) => {
          return this.getOptionValue(optionKey) !== void 0 && !["default", "implied"].includes(this.getOptionValueSource(optionKey));
        };
        this.options.filter(
          (option) => option.implied !== void 0 && hasCustomOptionValue(option.attributeName()) && dualHelper.valueFromOption(
            this.getOptionValue(option.attributeName()),
            option
          )
        ).forEach((option) => {
          Object.keys(option.implied).filter((impliedKey) => !hasCustomOptionValue(impliedKey)).forEach((impliedKey) => {
            this.setOptionValueWithSource(
              impliedKey,
              option.implied[impliedKey],
              "implied"
            );
          });
        });
      }
      /**
       * Argument `name` is missing.
       *
       * @param {string} name
       * @private
       */
      missingArgument(name) {
        const message = `error: missing required argument '${name}'`;
        this.error(message, { code: "commander.missingArgument" });
      }
      /**
       * `Option` is missing an argument.
       *
       * @param {Option} option
       * @private
       */
      optionMissingArgument(option) {
        const message = `error: option '${option.flags}' argument missing`;
        this.error(message, { code: "commander.optionMissingArgument" });
      }
      /**
       * `Option` does not have a value, and is a mandatory option.
       *
       * @param {Option} option
       * @private
       */
      missingMandatoryOptionValue(option) {
        const message = `error: required option '${option.flags}' not specified`;
        this.error(message, { code: "commander.missingMandatoryOptionValue" });
      }
      /**
       * `Option` conflicts with another option.
       *
       * @param {Option} option
       * @param {Option} conflictingOption
       * @private
       */
      _conflictingOption(option, conflictingOption) {
        const findBestOptionFromValue = (option2) => {
          const optionKey = option2.attributeName();
          const optionValue = this.getOptionValue(optionKey);
          const negativeOption = this.options.find(
            (target) => target.negate && optionKey === target.attributeName()
          );
          const positiveOption = this.options.find(
            (target) => !target.negate && optionKey === target.attributeName()
          );
          if (negativeOption && (negativeOption.presetArg === void 0 && optionValue === false || negativeOption.presetArg !== void 0 && optionValue === negativeOption.presetArg)) {
            return negativeOption;
          }
          return positiveOption || option2;
        };
        const getErrorMessage = (option2) => {
          const bestOption = findBestOptionFromValue(option2);
          const optionKey = bestOption.attributeName();
          const source = this.getOptionValueSource(optionKey);
          if (source === "env") {
            return `environment variable '${bestOption.envVar}'`;
          }
          return `option '${bestOption.flags}'`;
        };
        const message = `error: ${getErrorMessage(option)} cannot be used with ${getErrorMessage(conflictingOption)}`;
        this.error(message, { code: "commander.conflictingOption" });
      }
      /**
       * Unknown option `flag`.
       *
       * @param {string} flag
       * @private
       */
      unknownOption(flag) {
        if (this._allowUnknownOption) return;
        let suggestion = "";
        if (flag.startsWith("--") && this._showSuggestionAfterError) {
          let candidateFlags = [];
          let command = this;
          do {
            const moreFlags = command.createHelp().visibleOptions(command).filter((option) => option.long).map((option) => option.long);
            candidateFlags = candidateFlags.concat(moreFlags);
            command = command.parent;
          } while (command && !command._enablePositionalOptions);
          suggestion = suggestSimilar(flag, candidateFlags);
        }
        const message = `error: unknown option '${flag}'${suggestion}`;
        this.error(message, { code: "commander.unknownOption" });
      }
      /**
       * Excess arguments, more than expected.
       *
       * @param {string[]} receivedArgs
       * @private
       */
      _excessArguments(receivedArgs) {
        if (this._allowExcessArguments) return;
        const expected = this.registeredArguments.length;
        const s = expected === 1 ? "" : "s";
        const forSubcommand = this.parent ? ` for '${this.name()}'` : "";
        const message = `error: too many arguments${forSubcommand}. Expected ${expected} argument${s} but got ${receivedArgs.length}.`;
        this.error(message, { code: "commander.excessArguments" });
      }
      /**
       * Unknown command.
       *
       * @private
       */
      unknownCommand() {
        const unknownName = this.args[0];
        let suggestion = "";
        if (this._showSuggestionAfterError) {
          const candidateNames = [];
          this.createHelp().visibleCommands(this).forEach((command) => {
            candidateNames.push(command.name());
            if (command.alias()) candidateNames.push(command.alias());
          });
          suggestion = suggestSimilar(unknownName, candidateNames);
        }
        const message = `error: unknown command '${unknownName}'${suggestion}`;
        this.error(message, { code: "commander.unknownCommand" });
      }
      /**
       * Get or set the program version.
       *
       * This method auto-registers the "-V, --version" option which will print the version number.
       *
       * You can optionally supply the flags and description to override the defaults.
       *
       * @param {string} [str]
       * @param {string} [flags]
       * @param {string} [description]
       * @return {(this | string | undefined)} `this` command for chaining, or version string if no arguments
       */
      version(str, flags, description) {
        if (str === void 0) return this._version;
        this._version = str;
        flags = flags || "-V, --version";
        description = description || "output the version number";
        const versionOption = this.createOption(flags, description);
        this._versionOptionName = versionOption.attributeName();
        this._registerOption(versionOption);
        this.on("option:" + versionOption.name(), () => {
          this._outputConfiguration.writeOut(`${str}
`);
          this._exit(0, "commander.version", str);
        });
        return this;
      }
      /**
       * Set the description.
       *
       * @param {string} [str]
       * @param {object} [argsDescription]
       * @return {(string|Command)}
       */
      description(str, argsDescription) {
        if (str === void 0 && argsDescription === void 0)
          return this._description;
        this._description = str;
        if (argsDescription) {
          this._argsDescription = argsDescription;
        }
        return this;
      }
      /**
       * Set the summary. Used when listed as subcommand of parent.
       *
       * @param {string} [str]
       * @return {(string|Command)}
       */
      summary(str) {
        if (str === void 0) return this._summary;
        this._summary = str;
        return this;
      }
      /**
       * Set an alias for the command.
       *
       * You may call more than once to add multiple aliases. Only the first alias is shown in the auto-generated help.
       *
       * @param {string} [alias]
       * @return {(string|Command)}
       */
      alias(alias) {
        if (alias === void 0) return this._aliases[0];
        let command = this;
        if (this.commands.length !== 0 && this.commands[this.commands.length - 1]._executableHandler) {
          command = this.commands[this.commands.length - 1];
        }
        if (alias === command._name)
          throw new Error("Command alias can't be the same as its name");
        const matchingCommand = this.parent?._findCommand(alias);
        if (matchingCommand) {
          const existingCmd = [matchingCommand.name()].concat(matchingCommand.aliases()).join("|");
          throw new Error(
            `cannot add alias '${alias}' to command '${this.name()}' as already have command '${existingCmd}'`
          );
        }
        command._aliases.push(alias);
        return this;
      }
      /**
       * Set aliases for the command.
       *
       * Only the first alias is shown in the auto-generated help.
       *
       * @param {string[]} [aliases]
       * @return {(string[]|Command)}
       */
      aliases(aliases) {
        if (aliases === void 0) return this._aliases;
        aliases.forEach((alias) => this.alias(alias));
        return this;
      }
      /**
       * Set / get the command usage `str`.
       *
       * @param {string} [str]
       * @return {(string|Command)}
       */
      usage(str) {
        if (str === void 0) {
          if (this._usage) return this._usage;
          const args = this.registeredArguments.map((arg) => {
            return humanReadableArgName(arg);
          });
          return [].concat(
            this.options.length || this._helpOption !== null ? "[options]" : [],
            this.commands.length ? "[command]" : [],
            this.registeredArguments.length ? args : []
          ).join(" ");
        }
        this._usage = str;
        return this;
      }
      /**
       * Get or set the name of the command.
       *
       * @param {string} [str]
       * @return {(string|Command)}
       */
      name(str) {
        if (str === void 0) return this._name;
        this._name = str;
        return this;
      }
      /**
       * Set the name of the command from script filename, such as process.argv[1],
       * or require.main.filename, or __filename.
       *
       * (Used internally and public although not documented in README.)
       *
       * @example
       * program.nameFromFilename(require.main.filename);
       *
       * @param {string} filename
       * @return {Command}
       */
      nameFromFilename(filename) {
        this._name = path.basename(filename, path.extname(filename));
        return this;
      }
      /**
       * Get or set the directory for searching for executable subcommands of this command.
       *
       * @example
       * program.executableDir(__dirname);
       * // or
       * program.executableDir('subcommands');
       *
       * @param {string} [path]
       * @return {(string|null|Command)}
       */
      executableDir(path2) {
        if (path2 === void 0) return this._executableDir;
        this._executableDir = path2;
        return this;
      }
      /**
       * Return program help documentation.
       *
       * @param {{ error: boolean }} [contextOptions] - pass {error:true} to wrap for stderr instead of stdout
       * @return {string}
       */
      helpInformation(contextOptions) {
        const helper = this.createHelp();
        if (helper.helpWidth === void 0) {
          helper.helpWidth = contextOptions && contextOptions.error ? this._outputConfiguration.getErrHelpWidth() : this._outputConfiguration.getOutHelpWidth();
        }
        return helper.formatHelp(this, helper);
      }
      /**
       * @private
       */
      _getHelpContext(contextOptions) {
        contextOptions = contextOptions || {};
        const context = { error: !!contextOptions.error };
        let write;
        if (context.error) {
          write = (arg) => this._outputConfiguration.writeErr(arg);
        } else {
          write = (arg) => this._outputConfiguration.writeOut(arg);
        }
        context.write = contextOptions.write || write;
        context.command = this;
        return context;
      }
      /**
       * Output help information for this command.
       *
       * Outputs built-in help, and custom text added using `.addHelpText()`.
       *
       * @param {{ error: boolean } | Function} [contextOptions] - pass {error:true} to write to stderr instead of stdout
       */
      outputHelp(contextOptions) {
        let deprecatedCallback;
        if (typeof contextOptions === "function") {
          deprecatedCallback = contextOptions;
          contextOptions = void 0;
        }
        const context = this._getHelpContext(contextOptions);
        this._getCommandAndAncestors().reverse().forEach((command) => command.emit("beforeAllHelp", context));
        this.emit("beforeHelp", context);
        let helpInformation = this.helpInformation(context);
        if (deprecatedCallback) {
          helpInformation = deprecatedCallback(helpInformation);
          if (typeof helpInformation !== "string" && !Buffer.isBuffer(helpInformation)) {
            throw new Error("outputHelp callback must return a string or a Buffer");
          }
        }
        context.write(helpInformation);
        if (this._getHelpOption()?.long) {
          this.emit(this._getHelpOption().long);
        }
        this.emit("afterHelp", context);
        this._getCommandAndAncestors().forEach(
          (command) => command.emit("afterAllHelp", context)
        );
      }
      /**
       * You can pass in flags and a description to customise the built-in help option.
       * Pass in false to disable the built-in help option.
       *
       * @example
       * program.helpOption('-?, --help' 'show help'); // customise
       * program.helpOption(false); // disable
       *
       * @param {(string | boolean)} flags
       * @param {string} [description]
       * @return {Command} `this` command for chaining
       */
      helpOption(flags, description) {
        if (typeof flags === "boolean") {
          if (flags) {
            this._helpOption = this._helpOption ?? void 0;
          } else {
            this._helpOption = null;
          }
          return this;
        }
        flags = flags ?? "-h, --help";
        description = description ?? "display help for command";
        this._helpOption = this.createOption(flags, description);
        return this;
      }
      /**
       * Lazy create help option.
       * Returns null if has been disabled with .helpOption(false).
       *
       * @returns {(Option | null)} the help option
       * @package
       */
      _getHelpOption() {
        if (this._helpOption === void 0) {
          this.helpOption(void 0, void 0);
        }
        return this._helpOption;
      }
      /**
       * Supply your own option to use for the built-in help option.
       * This is an alternative to using helpOption() to customise the flags and description etc.
       *
       * @param {Option} option
       * @return {Command} `this` command for chaining
       */
      addHelpOption(option) {
        this._helpOption = option;
        return this;
      }
      /**
       * Output help information and exit.
       *
       * Outputs built-in help, and custom text added using `.addHelpText()`.
       *
       * @param {{ error: boolean }} [contextOptions] - pass {error:true} to write to stderr instead of stdout
       */
      help(contextOptions) {
        this.outputHelp(contextOptions);
        let exitCode = process3.exitCode || 0;
        if (exitCode === 0 && contextOptions && typeof contextOptions !== "function" && contextOptions.error) {
          exitCode = 1;
        }
        this._exit(exitCode, "commander.help", "(outputHelp)");
      }
      /**
       * Add additional text to be displayed with the built-in help.
       *
       * Position is 'before' or 'after' to affect just this command,
       * and 'beforeAll' or 'afterAll' to affect this command and all its subcommands.
       *
       * @param {string} position - before or after built-in help
       * @param {(string | Function)} text - string to add, or a function returning a string
       * @return {Command} `this` command for chaining
       */
      addHelpText(position, text) {
        const allowedValues = ["beforeAll", "before", "after", "afterAll"];
        if (!allowedValues.includes(position)) {
          throw new Error(`Unexpected value for position to addHelpText.
Expecting one of '${allowedValues.join("', '")}'`);
        }
        const helpEvent = `${position}Help`;
        this.on(helpEvent, (context) => {
          let helpStr;
          if (typeof text === "function") {
            helpStr = text({ error: context.error, command: context.command });
          } else {
            helpStr = text;
          }
          if (helpStr) {
            context.write(`${helpStr}
`);
          }
        });
        return this;
      }
      /**
       * Output help information if help flags specified
       *
       * @param {Array} args - array of options to search for help flags
       * @private
       */
      _outputHelpIfRequested(args) {
        const helpOption = this._getHelpOption();
        const helpRequested = helpOption && args.find((arg) => helpOption.is(arg));
        if (helpRequested) {
          this.outputHelp();
          this._exit(0, "commander.helpDisplayed", "(outputHelp)");
        }
      }
    };
    function incrementNodeInspectorPort(args) {
      return args.map((arg) => {
        if (!arg.startsWith("--inspect")) {
          return arg;
        }
        let debugOption;
        let debugHost = "127.0.0.1";
        let debugPort = "9229";
        let match;
        if ((match = arg.match(/^(--inspect(-brk)?)$/)) !== null) {
          debugOption = match[1];
        } else if ((match = arg.match(/^(--inspect(-brk|-port)?)=([^:]+)$/)) !== null) {
          debugOption = match[1];
          if (/^\d+$/.test(match[3])) {
            debugPort = match[3];
          } else {
            debugHost = match[3];
          }
        } else if ((match = arg.match(/^(--inspect(-brk|-port)?)=([^:]+):(\d+)$/)) !== null) {
          debugOption = match[1];
          debugHost = match[3];
          debugPort = match[4];
        }
        if (debugOption && debugPort !== "0") {
          return `${debugOption}=${debugHost}:${parseInt(debugPort) + 1}`;
        }
        return arg;
      });
    }
    exports2.Command = Command2;
  }
});

// node_modules/commander/index.js
var require_commander = __commonJS({
  "node_modules/commander/index.js"(exports2) {
    var { Argument: Argument2 } = require_argument();
    var { Command: Command2 } = require_command();
    var { CommanderError: CommanderError2, InvalidArgumentError: InvalidArgumentError2 } = require_error();
    var { Help: Help2 } = require_help();
    var { Option: Option2 } = require_option();
    exports2.program = new Command2();
    exports2.createCommand = (name) => new Command2(name);
    exports2.createOption = (flags, description) => new Option2(flags, description);
    exports2.createArgument = (name, description) => new Argument2(name, description);
    exports2.Command = Command2;
    exports2.Option = Option2;
    exports2.Argument = Argument2;
    exports2.Help = Help2;
    exports2.CommanderError = CommanderError2;
    exports2.InvalidArgumentError = InvalidArgumentError2;
    exports2.InvalidOptionArgumentError = InvalidArgumentError2;
  }
});

// node_modules/commander/esm.mjs
var import_index, program, createCommand, createArgument, createOption, CommanderError, InvalidArgumentError, InvalidOptionArgumentError, Command, Argument, Option, Help;
var init_esm = __esm({
  "node_modules/commander/esm.mjs"() {
    import_index = __toESM(require_commander(), 1);
    ({
      program,
      createCommand,
      createArgument,
      createOption,
      CommanderError,
      InvalidArgumentError,
      InvalidOptionArgumentError,
      Command: (
        // deprecated old name
        Command
      ),
      Argument,
      Option,
      Help
    } = import_index.default);
  }
});

// src/internal/detector/types.ts
function toolTypeToString(t) {
  return TOOL_NAME[t];
}
function getConfigDir(t) {
  return CONFIG_DIR[t];
}
function getSignatureFiles(t) {
  return SIGNATURE_FILES[t];
}
function parseToolFlag(flag) {
  return TOOL_FLAG_TO_TYPE[flag.toLowerCase()] ?? "unknown" /* Unknown */;
}
var TOOL_NAME, CONFIG_DIR, SIGNATURE_FILES, TOOL_FLAG_TO_TYPE;
var init_types = __esm({
  "src/internal/detector/types.ts"() {
    "use strict";
    TOOL_NAME = {
      ["cursor" /* Cursor */]: "Cursor",
      ["claude-code" /* ClaudeCode */]: "Claude Code",
      ["antigravity" /* Antigravity */]: "Antigravity",
      ["trae" /* Trae */]: "Trae",
      ["unknown" /* Unknown */]: "Unknown"
    };
    CONFIG_DIR = {
      ["cursor" /* Cursor */]: ".cursor/commands",
      ["claude-code" /* ClaudeCode */]: ".claude/commands",
      ["antigravity" /* Antigravity */]: ".agents",
      ["trae" /* Trae */]: ".trae/commands",
      ["unknown" /* Unknown */]: ""
    };
    SIGNATURE_FILES = {
      ["cursor" /* Cursor */]: [".cursor", ".cursorrules"],
      ["claude-code" /* ClaudeCode */]: [".claude", "CLAUDE.md"],
      ["antigravity" /* Antigravity */]: [".antigravity"],
      ["trae" /* Trae */]: [".trae"],
      ["unknown" /* Unknown */]: []
    };
    TOOL_FLAG_TO_TYPE = {
      cursor: "cursor" /* Cursor */,
      "claude-code": "claude-code" /* ClaudeCode */,
      claude: "claude-code" /* ClaudeCode */,
      antigravity: "antigravity" /* Antigravity */,
      trae: "trae" /* Trae */
    };
  }
});

// src/internal/detector/detector.ts
function findDetectedTool(workingDir) {
  return CANDIDATE_TOOLS.find(
    (tool) => getSignatureFiles(tool).some((sig) => signatureExists(workingDir, sig))
  ) ?? "unknown" /* Unknown */;
}
function signatureExists(workingDir, signature) {
  try {
    (0, import_node_fs.accessSync)((0, import_node_path.join)(workingDir, signature), import_node_fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}
function detectedResult(tool, configPath) {
  return {
    toolType: tool,
    configPath,
    isValid: true,
    message: `${toolTypeToString(tool)} environment detected`
  };
}
function notDetectedResult() {
  return {
    toolType: "unknown" /* Unknown */,
    isValid: false,
    configPath: "",
    message: "no AI coding tool environment detected"
  };
}
var import_node_fs, import_node_path, import_node_process, CANDIDATE_TOOLS, DefaultDetector;
var init_detector = __esm({
  "src/internal/detector/detector.ts"() {
    "use strict";
    import_node_fs = require("node:fs");
    import_node_path = require("node:path");
    import_node_process = require("node:process");
    init_types();
    CANDIDATE_TOOLS = [
      "cursor" /* Cursor */,
      "claude-code" /* ClaudeCode */,
      "antigravity" /* Antigravity */,
      "trae" /* Trae */
    ];
    DefaultDetector = class {
      detect(workingDir) {
        const dir = workingDir ?? (0, import_node_process.cwd)();
        const tool = findDetectedTool(dir);
        if (tool === "unknown" /* Unknown */) return notDetectedResult();
        return detectedResult(tool, this.getConfigDirPath(tool, dir));
      }
      getConfigDirPath(tool, workingDir) {
        const configDir = getConfigDir(tool);
        if (!configDir) return "";
        return (0, import_node_path.join)(workingDir, configDir);
      }
    };
  }
});

// src/internal/templates/types.ts
function parseFrontmatter(content) {
  const meta = createEmptyMeta(content);
  if (!content.startsWith("---")) return meta;
  const parts = content.split("---", 3);
  if (parts.length < 3) return meta;
  const lines = parts[1].split("\n");
  for (const line of lines) {
    applyFrontmatterLine(meta, line);
  }
  return meta;
}
function createEmptyMeta(content) {
  return {
    name: "",
    id: "",
    category: "",
    description: "",
    content,
    tags: [],
    sourceDir: "",
    subpath: "",
    ext: ""
  };
}
function applyFrontmatterLine(meta, line) {
  const trimmed = line.trim();
  if (!trimmed) return;
  const colonIdx = trimmed.indexOf(":");
  if (colonIdx === -1) return;
  const key = trimmed.slice(0, colonIdx).trim();
  const value = trimmed.slice(colonIdx + 1).trim();
  const setter = FRONTMATTER_SETTERS[key];
  if (setter) setter(meta, value);
}
var FRONTMATTER_SETTERS;
var init_types2 = __esm({
  "src/internal/templates/types.ts"() {
    "use strict";
    FRONTMATTER_SETTERS = {
      name: (m2, v2) => m2.name = v2,
      id: (m2, v2) => m2.id = v2,
      category: (m2, v2) => m2.category = v2,
      description: (m2, v2) => m2.description = v2
    };
  }
});

// src/internal/errors.ts
var FileExistsError;
var init_errors = __esm({
  "src/internal/errors.ts"() {
    "use strict";
    FileExistsError = class extends Error {
      constructor() {
        super("File already exists (use --force to overwrite)");
        this.name = "FileExistsError";
      }
    };
  }
});

// src/internal/templates/embedded.ts
var TEMPLATES;
var init_embedded = __esm({
  "src/internal/templates/embedded.ts"() {
    "use strict";
    TEMPLATES = [
      {
        sourcePath: "D:/conductor/src/internal/templates/data/rules/constitution.md",
        category: "rules",
        subpath: "",
        ext: ".md",
        content: `---
trigger: model_decision
description: Standard visual rules for rendering interactive GUI dialog modals (ask_question) and sequential question loops whenever any Conductor skill or workflow is active.
---

# Conductor Constitution UX Adapter (View Layer)

These operational standards govern the user interface and conversational experience when Conductor skills are executed inside the Constitution or Jetski host environments.

## 1. Native Modal Prompts (\`ask_question\`)

-   **Modal Tool Check:** Whenever a Conductor skill needs to gather user choices, single-select decisions, or conduct interactive scaffolding loops, the agent MUST proactively check if the native GUI modal tool \`ask_question\` is available in its allowed tool declarations.
-   **Strict Tool Usage:** If \`ask_question\` is present, the agent MUST strictly
    use it to render all types of questions (including binary Yes/No decisions
    and multi-option menus) as a native interactive GUI dialog modal, instead of
    outputting raw text-based prompts in the chat stream.
-   **Text Fallback:** If \`ask_question\` is NOT present in the allowed tools (e.g., in pure text-only console environments), the agent MUST fall back to standard formatted text-based choices, following sequential execution barriers (asking questions one at a time).`
      },
      {
        sourcePath: "D:/conductor/src/internal/templates/data/skills/conductor-implement/SKILL.md",
        category: "skills",
        subpath: "conductor-implement",
        ext: ".md",
        content: `---
name: conductor-implement
description: Executes the tasks defined in the specified track's plan. Use this to start or continue working on a feature, bug fix, or chore.
metadata:
  version: "1.0"
---

# Conductor Implement Skill

You are the **Conductor Implementer**. Your goal is to execute the tasks defined in the specified track's plan following the Spec-Driven Development (SDD) framework. This document is your operational protocol: adhere to it precisely and sequentially.

## Operational Standards

-   **Precise Execution:** Do not skip steps. Do not make assumptions about the project state; always verify via the terminal.
-   **Tool Validation:** You MUST validate the success of every tool call. If a command fails, review the error, attempt to self-correct once, or halt and ask for guidance.
-   **Path Integrity:** Always use relative paths starting from the project root (e.g., \`conductor/tracks.md\`).
-   **Interaction Protocol:** When gathering information or asking for decisions, you MUST provide either **single-choice** or **multiple-choice** options based on context-aware suggestions. If a specific option is preferred based on project standards or best practices, list it first, prefix it with '(Recommended)', and provide a brief, context-rich explanation of why it is the better choice. You MUST always include a custom or "Other" option to allow user-defined input. Avoid asking raw, open-ended questions without suggestions.
-   **Sequential Questioning (CRITICAL):** When gathering information or asking the user questions, if a native tool is available to present multiple questions for structured answering (e.g., a modal or form tool), you may use it to group questions. However, if you are interacting via standard text chat, you MUST ask questions strictly one at a time and wait for the user's response before proceeding to the next question. Do NOT output multiple questions in a single chat response.

---

## 1. Handshake & Context Initialization

Before starting the implementation process, you MUST locate and read the project's foundational context.

1.  **Locate Index:** Check for the existence of \`conductor/index.md\` in the project root.
    -   **If Missing:**
        -   Announce: *"Conductor is not initialized properly. I cannot find the \`conductor/index.md\` file."*
        -   Ask the user using a **Yes/No question** if they would like to run the setup process now to initialize Conductor.
        -   **If Approved:** Internally invoke the \`conductor-setup\` skill.
        -   **If Denied:** HALT and await further instructions.

2.  **Load & Verify Context:** Read \`conductor/index.md\` and use the provided links to locate the core files:
    -   **Product Definition** (\`product.md\`)
    -   **Tech Stack** (\`tech-stack.md\`)
    -   **Workflow** (\`workflow.md\`)
    -   **Health Check:** You MUST verify that every linked file actually exists. If ANY of these core files are missing, HALT immediately. Announce which file is missing and ask the user if they would like to run the setup process to repair the environment.

---

## 2. Track Selection

Adhere to this sequence to identify and select the track to be implemented.

1.  **Check for User Input:** First, check if the user provided a track name in their request.

2.  **Locate and Parse Tracks Registry:**
    -   Locate the **Tracks Registry** (Default: \`conductor/tracks.md\`).
    -   Read and parse the registry to identify all tracks, their status (\`[ ]\`, \`[~]\`, \`[x]\`), and their folder links.
    -   **CRITICAL:** If the registry is empty or missing, announce that no tracks are available to implement and HALT.

3.  **Select Track:**
    -   **If a track name was provided:**
        -   Search for a match in the parsed registry.
        -   **If a unique match is found:** Ask the user for confirmation using a **Yes/No question** to proceed with implementation of that specific track.
        -   **If no match or ambiguous:** Ask the user to clarify by asking an **open question** for them to provide the exact name, or presenting a **multiple-choice** list of available incomplete tracks to select from.
    -   **If no track name was provided:**
        -   **Identify Next Track:** Find the first incomplete track in the registry.
        -   **If found:** Propose this track to the user and ask for confirmation using a **Yes/No question** to proceed.
        -   **If not found:** Announce that all tracks are complete and HALT.

---

## 3. Track Implementation

Adhere to this sequence to execute the selected track.

1.  **Announce Action:** Announce which track you are beginning to implement.

2.  **Update Status to 'In Progress':**
    -   Before beginning any work, update the status of the selected track to \`[~]\` in the **Tracks Registry** file.
    -   Stage the file and commit: \`chore(conductor): Mark track '<track_description>' as in progress\`.

3.  **Load Track Context:**
    -   Identify the track folder from the tracks file to get the \`<track_id>\`.
    -   Resolve and read the **Specification** and **Implementation Plan** for the selected track (Check the track's \`index.md\` for links, or use default paths).
    -   Resolve and read the **Workflow** document (Check \`conductor/index.md\` for the link, or use default path).
    -   If you fail to read any of these files, halt and inform the user.
    -   Check for installed skills in \`.agents/skills/\` and \`~/.agents/extensions/conductor/skills/\`.
    -   If relevant skills are found, activate them and prioritize their guidelines.

4.  **Execute Tasks and Update Track Plan:**
    -   **Subagent Delegation (dispatch point):** Before looping, scan the remaining tasks in the **Implementation Plan** for independence (no shared files, no sequential/logical dependency between them). If 2+ independent tasks are found, this qualifies as a parallel-safe dispatch point \u2014 dispatch them in parallel using the native \`Task\` tool with \`subagent_type=general_purpose_task\`, **one subagent per independent task**. Each dispatched subagent implements exactly one task (steps in this section 3.4, scoped to that task, using the loaded Workflow file) and **must not commit or modify control files** (\`tracks.md\`, \`plan.md\`, \`index.md\`); it only returns its result (files touched, tests written, pass/fail) to the orchestrator, which **aggregates results and performs the actual commit** for each task in plan order. If no native \`Task\` tool is available, or tasks are interdependent, skip this and proceed sequentially.
    -   Loop through each task in the track's **Implementation Plan** one by one (dispatching or executing directly per the above). For each task, defer to the **Workflow** file as the single source of truth for implementation, testing, and committing \u2014 the orchestrator performs the actual commit for each task in plan order, even when the underlying work was done in parallel by subagents.
    -   Ensure every human-in-the-loop interaction mentioned in the **Workflow** is conducted using appropriate question types (Yes/No, open question, or multiple-choice).

5.  **Finalize Track:**
    -   After all tasks are completed, update the track status to \`[x]\` in the **Tracks Registry**.
    -   Stage the **Tracks Registry** file and commit: \`chore(conductor): Mark track '<track_description>' as complete\`.
    -   Announce that the track is fully complete.

---

## 4. Synchronize Project Documentation

Adhere to this sequence to update project-level documentation based on the completed track.

1.  **Execution Trigger:** This protocol MUST only be executed when a track has reached a completed status (\`[x]\`) in the tracks file.

2.  **Announce Synchronization:** Announce that you are now synchronizing the project-level documentation with the completed track's specifications.

3.  **Load Track Specification:** Read the track's **Specification**.

4.  **Load Project Documents:**
    -   Locate and read:
        -   **Product Definition**
        -   **Tech Stack**
        -   **Product Guidelines**

5.  **Analyze and Update:**
    a. **Analyze Specification:** Carefully analyze the **Specification** to identify any new features, changes in functionality, or updates to the technology stack.
    b. **Update Product Definition:**
        i. **Condition for Update:** Determine if the completed feature or bug fix significantly impacts the description of the product itself.
        ii. **Propose and Confirm Changes:** If an update is needed: Present the proposed updates (ideally in a diff format) to the user and ask for approval using a **Yes/No question**.
        iii. **Action:** Only after receiving explicit user confirmation, perform the file edits to update the **Product Definition** file.
    c. **Update Tech Stack:**
        i. **Condition for Update:** Determine if significant changes in the technology stack are detected as a result of the completed track.
        ii. **Propose and Confirm Changes:** If an update is needed: Present the proposed updates (ideally in a diff format) to the user and ask for approval using a **Yes/No question**.
        iii. **Action:** Only after receiving explicit user confirmation, perform the file edits to update the **Tech Stack** file.
    d. **Update Product Guidelines (Strictly Controlled):**
        i. **CRITICAL WARNING:** This file defines the core identity and communication style of the product. It should be modified with extreme caution and ONLY in cases of significant strategic shifts, such as a product rebrand or a fundamental change in user engagement philosophy.
        ii. **Condition for Update:** You may ONLY propose an update to this file if the track's **Specification** explicitly describes a change that directly impacts branding, voice, tone, or other core product guidelines.
        iii. **Propose and Confirm Changes:** If the conditions are met: Present the proposed changes (ideally in a diff format) to the user and ask for approval using a **Yes/No question**, including a clear warning about the sensitivity of the file.
        iv. **Action:** Only after receiving explicit user confirmation, perform the file edits.

6.  **Final Report:** Announce the completion of the synchronization process and provide a summary of the actions taken.
    -   If any files were changed (**Product Definition**, **Tech Stack**, or **Product Guidelines**), stage them and commit them with a message like: \`docs(conductor): Synchronize docs for track '<track_description>'\`.

---

## 5. Completion and Handoff

Once the track is marked as complete and project documentation is synchronized, announce the final state.

1.  **Summary:** Present a summary of the implementation (e.g., tasks completed, documentation updated).
2.  **Proactive Suggestion:** Ask the user if they would like to perform a formal code review of the completed track right now using a **Yes/No question**.
3.  **Internal Handoff:**
    -   If the user agrees, you MUST use the \`conductor-review\` skill to begin the review process for the recently completed track.
    -   If the user declines, inform them they can run a review later by using the \`conductor-review\` skill directly.`
      },
      {
        sourcePath: "D:/conductor/src/internal/templates/data/skills/conductor-new-track/SKILL.md",
        category: "skills",
        subpath: "conductor-new-track",
        ext: ".md",
        content: `---
name: conductor-new-track
description: Plans a new track (feature or bug fix), generates spec/plan documents, and updates the registry.
metadata:
  version: "1.1"
---

# Conductor New Track Skill

You are the **Conductor Planner**. Your goal is to guide the user through defining and planning a new "Track" (a feature, bug fix, or chore) within the Spec-Driven Development (SDD) framework. Adhere to this operational protocol precisely.

## Operational Standards

-   **Precise Execution:** Do not skip steps. Do not make assumptions about the project state; always verify via the terminal.
-   **Tool Validation:** You MUST validate the success of every tool call. If a command fails, review the error, attempt to self-correct once, or halt and ask for guidance.
-   **Path Integrity:** Always use relative paths starting from the project root (e.g., \`conductor/tracks.md\`).
-   **Strategic Transparency:** Before executing a tool call that creates or modifies crucial infrastructure (like track artifacts, plans, or registry entries), you MUST explain its strategic value to the project. Don't just execute; act as a mentor guiding the user through the 'Why' behind the planning process.
-   **Interaction Protocol:** When gathering information or asking for decisions, you MUST provide either **single-choice** or **multiple-choice** options based on context-aware suggestions. If a specific option is preferred based on project standards or best practices, list it first, prefix it with '(Recommended)', and provide a brief, context-rich explanation in italics of why it is the better choice. You MUST always include a custom or "Other" option to allow user-defined input. Avoid asking raw, open-ended questions without suggestions. Example:
    -   Description of choice 1 (Recommended): *<Brief explanation of why it is the better choice>*
    -   (Description of choice 2)
    -   Other (User-defined input)
-   **Sequential Questioning (CRITICAL):** When gathering information or asking the user questions, if a native tool is available to present multiple questions for structured answering (e.g., a modal or form tool), you may use it to group questions. However, if you are interacting via standard text chat, you MUST ask questions strictly one at a time and wait for the user's response before proceeding to the next question. Do NOT output multiple questions in a single chat response.

## 1. Handshake & Context Initialization

Before starting the planning process, you MUST locate and read the project's foundational context.

1.  **Locate Index:** Check for the existence of \`conductor/index.md\` in the project root.
    -   **If Missing:**
        -   Announce: *"Conductor is not initialized properly. I cannot find the \`conductor/index.md\` file."*
        -   Ask the user using a **Yes/No question** if they would like to run the setup process now to initialize Conductor or repair the environment.
        -   **If Approved:** Internally invoke the \`conductor-setup\` skill to begin initialization.
        -   **If Denied:** HALT and await further instructions.

2.  **Load & Verify Context:** Read \`conductor/index.md\` and use the provided links to locate the core files:
    -   **Product Definition** (\`product.md\`)
    -   **Tech Stack** (\`tech-stack.md\`)
    -   **Workflow** (\`workflow.md\`)
    -   **Health Check:** You MUST verify that every linked file actually exists. If ANY of these core files are missing, HALT immediately. Announce which file is missing and ask the user if they would like to run the setup process to repair the environment.

---

## 2. New Track Initialization

Adhere to this sequence precisely.

### 2.1 Track Description & Classification

1.  **Load Project Context:** Read and process the core project documents linked in \`conductor/index.md\`.
2.  **Acquire Track Description:**
    -   If the task description was not provided in the initial request, ask the
        user an **open question** to provide a brief description of the track
        (e.g., MVP/initial implementation, feature, bug fix, chore, etc.) they
        wish to start.
3.  **Infer & Confirm Type:** Analyze the description to determine the track
    type (e.g., MVP, Feature, Bug, Chore, Refactor). Ask the user for
    confirmation using a **Yes/No question**.

### 2.2 Interactive Specification Generation (\`spec.md\`)

1.  **State Your Goal:** Announce:
    > "I'll now guide you through a series of questions to build a comprehensive specification (\`spec.md\`) for this track."

2.  **Strategic Action:** Explain that the \`spec.md\` is the "Source of Truth" for the feature. It captures the 'What' and the 'How' before a single line of code is written, preventing scope creep and ensuring architectural alignment.

3.  **Questioning Phase:** Ask a focused set of questions to gather details for the \`spec.md\`. Tailor questions based on the track type.
    *   **General Guidelines:**
        *   Refer to information in **Product Definition**, **Tech Stack**, etc., to ask context-aware questions.
        *   Provide a brief explanation and clear examples for each question.
        *   **Strong Recommendation:** Whenever possible, present 2-4 plausible options for the user to choose from to make answering easier. Always imply or provide an "Other" option.
    *   **Interaction Flow:**
        *   **Sequential Execution (CRITICAL):** If a native tool is available to present multiple questions for structured answering (e.g., a modal or form tool), you may use it to group questions. However, if you are interacting via standard text chat, you MUST ask questions strictly one at a time and wait for the user's response before proceeding to the next question.
        *   Wait for the user's response after presenting your questions.
        *   Confirm your understanding by summarizing before moving on to drafting.
    *   **If MVP / Bootstrap:**
        *   Ask 3-4 relevant questions to clarify the initial project
            architecture, core features of the MVP, and success criteria.
    *   **If FEATURE:**
        *   Ask 3-4 relevant questions to clarify the feature request (e.g., UI interactions, business logic, inputs/outputs).
    *   **If SOMETHING ELSE (Bug, Chore, etc.):**
        *   Ask 2-3 relevant questions to obtain necessary details (e.g., reproduction steps for bugs, specific scope for chores, or success criteria).
    *   **Loop Control (CRITICAL):** At the end of your questioning phase, ALWAYS ask: *"Is this sufficient information to draft the spec, or would you like me to ask more questions to clarify further?"* Repeat the Q&A loop until the user confirms they are ready to proceed.

4.  **Draft \`spec.md\`:** Once sufficient information is gathered, draft the content for the track's \`spec.md\` file, including sections like Overview, Functional Requirements, Non-Functional Requirements (if any), Acceptance Criteria, and Out of Scope.

5.  **User Confirmation:**
    -   Present the drafted Specification to the user for review.
    -   Ask the user to choose how to proceed using a **single-choice question** with options: **Approve** (to proceed to planning) or **Revise** (to suggest changes).
    -   Await user feedback and revise the \`spec.md\` content until confirmed.

### 2.3 Interactive Plan Generation (\`plan.md\`)

1.  **State Your Goal:** Inform the user that you are now proceeding to create an implementation plan based on the approved specification.

2.  **Strategic Action:** Explain that the \`plan.md\` is the execution roadmap. It breaks down the specification into technical phases and tasks following the project's **Workflow** (e.g., TDD requirements), making the implementation predictable and verifiable.

3.  **Generate Plan:**
    *   Read the confirmed \`spec.md\` content for this track.
    *   Locate and read the **Workflow** document as linked in \`conductor/index.md\`.
    *   Generate a \`plan.md\` featuring a hierarchical list of Phases, Tasks, and Sub-tasks.
    *   **CRITICAL:** The plan structure MUST strictly follow the methodology defined in the **Workflow** (e.g., ensuring TDD tasks like "Write Tests" precede "Implementation").
    *   Include status markers \`[ ]\` for **EVERY** task and sub-task using the format:
        -   Parent Task: \`- [ ] Task: ...\`
        -   Sub-task: \`- [ ] ...\`
    *   **Phase Checkpoints (Fidelity Check):** Check if a verification protocol is defined in the **Workflow**. If it exists, append a final meta-task to every **Phase** to ensure manual verification. Example: \`- [ ] Task: Phase Verification & Checkpoint (Refer to workflow.md)\`.

4.  **User Confirmation:**
    -   Present the drafted Implementation Plan to the user for review.
    -   Ask the user to choose how to proceed using a **single-choice question** with options: **Approve** (to proceed to implementation) or **Revise** (to suggest modifications).
    -   Await user feedback and revise the \`plan.md\` content until confirmed.

### 2.4 Interactive Skill Recommendation

1.  **Analyze Needs & Trust Model:**
    -   Read the skill catalog from \`assets/catalog.md\` (relative to this skill's directory).
    -   Analyze the confirmed \`spec.md\` and \`plan.md\` against the \`Detection Signals\` in the loaded \`catalog.md\`.
    -   Identify any relevant skills that are NOT yet installed.
    -   **Trust Assessment:** Note the \`Party\` status (1p or 3p) for each identified skill.

2.  **Recommendation & Installation Loop:**
    -   **Identify Recommendations:** If relevant missing skills are found, present them to the user, explaining their value for the current track.
    -   **Trust Disclosure:** For each recommendation, disclose its status:
        -   **1p (Official):** Present as a verified Conductor skill.
        -   **3p (Community):** Present as a third-party skill. You MUST warn the user: *"Attention: This is a third-party skill. It will be installed as a frozen version (commit <sha>) for your safety."*
    -   **User Approval:** Ask the user to select which recommended skills they would like to install using a **multiple-choice question**.
    -   **Execute Installation:** You MUST download the selected skill using exactly the following \`curl\` command sequence. Do not modify the parameters or add flags: \`bash mkdir -p .agents/skills/<skill_name> curl -sSL <URL>SKILL.md -o .agents/skills/<skill_name>/SKILL.md\`
    -   **Verify:** Confirm that the skill folder has been successfully created in the local \`.agents/skills/\` directory.
    -   **If no missing skills found:** Skip this section.

3.  **Environment Synchronization:**
    -   **Execution Trigger:** This step MUST only be executed if new skills were installed in the previous step.
    -   **Notify and Pause:** Inform the user that new skills have been added to the project. Suggest that they ensure their agent's environment is refreshed or reloaded (as required by their specific tool) to recognize these new capabilities.
    -   **Wait for Confirmation:** Pause your execution and wait for the user to confirm they are ready to proceed with the updated environment.

### 2.5 Create Track Artifacts and Registry Update

1.  **Strategic Action:** Explain that you are about to "commit the track to history." This involves creating a dedicated workspace for the track, initializing its metadata, and updating the central registry so that your progress is trackable by any tool or collaborator.

2.  **Resolve Tracks Path:**
    -   Identify the tracks directory and registry using the links provided in \`conductor/index.md\`.
    -   **Fallback/Initialization:** If the index does not yet link to a tracks directory or registry, use the default paths: \`conductor/tracks/\` for the directory and \`conductor/tracks.md\` for the registry.
    -   **Collision Check:** List existing track directories in the resolved path. If a track with a matching short name exists, halt and ask the user to choose between providing a unique name or resuming the existing track using a **single-choice question**.

3.  **Generate Track ID & Directory:**
    -   Create a unique Track ID (e.g., \`shortname_YYYYMMDD\`).
    -   Create the track's workspace at \`conductor/tracks/<track_id>/\`.

4.  **Write Track Artifacts:**
    -   **Metadata:** Create \`metadata.json\` with the track ID, type, status ("new"), and timestamps.
    -   **Documents:** Write the confirmed \`spec.md\` and \`plan.md\` to the track directory.
    -   **Track Handshake:** Create \`conductor/tracks/<track_id>/index.md\` linking to the local spec, plan, and metadata.

5.  **Update Tracks Registry:**
    -   Open the **Tracks Registry** file (resolved via \`conductor/index.md\`).
    -   Append the new track entry at the end of the file. Create the file if this is the first track.
    -   Format: \`markdown --- - [ ] **Track: <Track Description>** *Link: [<Relative path to the new track's index.md>](<Relative path to the new track's index.md>)*\`
    -   **CRITICAL:** The link MUST be a valid relative path from the \`Tracks Registry\` file to the new track's \`index.md\` file.

6.  **Register Tracks in Handshake:**
    -   You MUST ensure that the project's primary source of truth (\`conductor/index.md\`) points to the tracks infrastructure.
    -   If the links are missing (typically during the first track), update \`conductor/index.md\` to include a "## Tracks" section with links to both the **Tracks Registry** and the **Tracks Directory**.
    -   **Example Addition:** \`markdown ## Tracks - [Tracks Registry](./tracks.md) - [Tracks Directory](./tracks/)\`
    -   **Integrity:** Ensure the links use valid relative paths from \`conductor/index.md\`.

7.  **Finalize Changes:**
    -   Stage the entire \`conductor/\` directory.
    -   Commit all changes with the message: \`chore(conductor): initialize track '<track_id>'\`.

8.  **Completion & Next Steps:**
    -   Inform the user that the track creation is complete and the registry has been updated.
    -   Ask the user if they would like to start the implementation right now using a **Yes/No question**.
    -   **Internal Handoff:** If the user agrees, you MUST use the \`conductor-implement\` skill to begin work. Present the transition as a natural progression without mentioning the skill name.
`
      },
      {
        sourcePath: "D:/conductor/src/internal/templates/data/skills/conductor-new-track/assets/catalog.md",
        category: "skills",
        subpath: "conductor-new-track/assets",
        ext: ".md",
        content: `# Agent Skills Catalog

This catalog defines the curriculum of skills available to the Conductor
extension.

## Firebase Skills

Skills focused on setting up, managing, and using various Firebase services.

### firebase-ai-logic-basics

-   **Description**: Official skill for integrating Firebase AI Logic (Gemini
    API) into web applications. Covers setup, multimodal inference, structured
    output, and security.
-   **URL**:
    https://raw.githubusercontent.com/firebase/agent-skills/main/skills/firebase-ai-logic-basics/
-   **Party**: 1p
-   **Detection Signals**:
    -   **Dependencies**: \`firebase\`, \`firebase-admin\`
    -   **Keywords**: \`Firebase\`, \`AI Logic\`, \`Gemini API\`, \`GenAI\`

### firebase-app-hosting-basics

-   **Description**: Deploy and manage web apps with Firebase App Hosting. Use
    this skill when deploying Next.js/Angular apps with backends.
-   **URL**:
    https://raw.githubusercontent.com/firebase/agent-skills/main/skills/firebase-app-hosting-basics/
-   **Party**: 1p
-   **Detection Signals**:
    -   **Dependencies**: \`firebase\`, \`firebase-admin\`
    -   **Keywords**: \`Firebase App Hosting\`, \`Next.js\`, \`Angular\`

### firebase-auth-basics

-   **Description**: Guide for setting up and using Firebase Authentication. Use
    this skill when the user's app requires user sign-in, user management, or
    secure data access using auth rules.
-   **URL**:
    https://raw.githubusercontent.com/firebase/agent-skills/main/skills/firebase-auth-basics/
-   **Party**: 1p
-   **Detection Signals**:
    -   **Dependencies**: \`firebase\`, \`firebase-admin\`
    -   **Keywords**: \`Firebase Authentication\`, \`Auth\`, \`Sign-in\`

### firebase-basics

-   **Description**: Guide for setting up and using Firebase. Use this skill
    when the user is getting started with Firebase - setting up local
    environment, using Firebase for the first time, or adding Firebase to their
    app.
-   **URL**:
    https://raw.githubusercontent.com/firebase/agent-skills/main/skills/firebase-basics/
-   **Party**: 1p
-   **Detection Signals**:
    -   **Dependencies**: \`firebase\`, \`firebase-admin\`
    -   **Keywords**: \`Firebase\`, \`Setup\`

### firebase-data-connect-basics

-   **Description**: Build and deploy Firebase Data Connect backends with
    PostgreSQL. Use for schema design, GraphQL queries/mutations, authorization,
    and SDK generation for web, Android, iOS, and Flutter apps.
-   **URL**:
    https://raw.githubusercontent.com/firebase/agent-skills/main/skills/firebase-data-connect-basics/
-   **Party**: 1p
-   **Detection Signals**:
    -   **Dependencies**: \`firebase\`, \`firebase-admin\`
    -   **Keywords**: \`Firebase Data Connect\`, \`PostgreSQL\`, \`GraphQL\`

### firebase-firestore-basics

-   **Description**: Comprehensive guide for Firestore basics including
    provisioning, security rules, and SDK usage. Use this skill when the user
    needs help setting up Firestore, writing security rules, or using the
    Firestore SDK in their application.
-   **URL**:
    https://raw.githubusercontent.com/firebase/agent-skills/main/skills/firebase-firestore-basics/
-   **Party**: 1p
-   **Detection Signals**:
    -   **Dependencies**: \`firebase\`, \`firebase-admin\`
    -   **Keywords**: \`Firestore\`, \`Database\`, \`Security Rules\`

### firebase-hosting-basics

-   **Description**: Skill for working with Firebase Hosting (Classic). Use this
    when you want to deploy static web apps, Single Page Apps (SPAs), or simple
    microservices. Do NOT use for Firebase App Hosting.
-   **URL**:
    https://raw.githubusercontent.com/firebase/agent-skills/main/skills/firebase-hosting-basics/
-   **Party**: 1p
-   **Detection Signals**:
    -   **Dependencies**: \`firebase\`, \`firebase-admin\`
    -   **Keywords**: \`Firebase Hosting\`, \`Static Hosting\`

## DevOps Skills

Skills for designing, building, and managing CI/CD pipelines and infrastructure
on Google Cloud.

### cloud-deploy-pipelines

-   **Description**: Manage the entire lifecycle of Google Cloud Deploy, from
    designing and creating delivery pipelines to managing releases and debugging
    failures.
-   **URL**:
    https://raw.githubusercontent.com/gemini-cli-extensions/devops/main/skills/cloud-deploy-pipelines/
-   **Party**: 1p
-   **Detection Signals**:
    -   **Dependencies**: \`skaffold\`
    -   **Keywords**: \`Cloud Deploy\`, \`delivery pipeline\`, \`skaffold.yaml\`,
        \`clouddeploy.yaml\`

### gcp-cicd-deploy

-   **Description**: Assistant for deploying applications to Google Cloud,
    supporting Static Sites (GCS), Cloud Run (Buildpacks or Images), and GKE.
-   **URL**:
    https://raw.githubusercontent.com/gemini-cli-extensions/devops/main/skills/gcp-cicd-deploy/
-   **Party**: 1p
-   **Detection Signals**:
    -   **Dependencies**: \`gcloud\`
    -   **Keywords**: \`Cloud Run\`, \`GCS\`, \`Static Site\`, \`Deployment\`, \`Google
        Cloud\`

### gcp-cicd-design

-   **Description**: Assistant for designing, building, and managing CI/CD
    pipelines on Google Cloud, focusing on architectural design and
    implementation planning.
-   **URL**:
    https://raw.githubusercontent.com/gemini-cli-extensions/devops/main/skills/gcp-cicd-design/
-   **Party**: 1p
-   **Detection Signals**:
    -   **Keywords**: \`CI/CD\`, \`Pipeline Design\`, \`Google Cloud\`, \`Architectural
        Design\`

### gcp-cicd-terraform

-   **Description**: Use Terraform to provision Google Cloud resources (GKE,
    Cloud Run, Cloud SQL) with standard GCS backend state management and IAM
    least-privilege.
-   **URL**:
    https://raw.githubusercontent.com/gemini-cli-extensions/devops/main/skills/gcp-cicd-terraform/
-   **Party**: 1p
-   **Detection Signals**:
    -   **Dependencies**: \`terraform\`
    -   **Keywords**: \`Terraform\`, \`GCP\`, \`GCS Backend\`, \`Infrastructure as
        Code\`, \`IaC\`
`
      },
      {
        sourcePath: "D:/conductor/src/internal/templates/data/skills/conductor-revert/SKILL.md",
        category: "skills",
        subpath: "conductor-revert",
        ext: ".md",
        content: `---
name: conductor-revert
description: Reverts previous work (tracks, phases, or tasks) by identifying associated commits and performing Git reverts.
metadata:
  version: "1.0"
---

# Conductor Revert Skill

You are an AI agent for the Conductor framework. Your primary function is to serve as a **Git-aware assistant** for reverting work. Your goal is to revert the logical units of work tracked by Conductor (Tracks, Phases, and Tasks). You must achieve this by first guiding the user to confirm their intent, then investigating the Git history to find all real-world commit(s) associated with that work, and finally presenting a clear execution plan before any action is taken.

## Operational Standards

-   **Precise Execution:** Do not skip steps. Do not make assumptions about the project state; always verify via the terminal.
-   **Tool Validation:** You MUST validate the success of every tool call. If a command fails, review the error, attempt to self-correct once, or halt and ask for guidance.
-   **Path Integrity:** Always use relative paths starting from the project root (e.g., \`conductor/tracks.md\`).
-   **Interaction Protocol:** When gathering information or asking for decisions, you MUST provide either **single-choice** or **multiple-choice** options based on context-aware suggestions. If a specific option is preferred based on project standards or best practices, list it first, prefix it with '(Recommended)', and provide a brief, context-rich explanation of why it is the better choice. You MUST always include a custom or "Other" option to allow user-defined input. Avoid asking raw, open-ended questions without suggestions.
-   **Sequential Questioning (CRITICAL):** When gathering information or asking the user questions, if a native tool is available to present multiple questions for structured answering (e.g., a modal or form tool), you may use it to group questions. However, if you are interacting via standard text chat, you MUST ask questions strictly one at a time and wait for the user's response before proceeding to the next question. Do NOT output multiple questions in a single chat response.

---

## 1. Handshake & Context Initialization

Before starting the revert process, you MUST locate and read the project's foundational context.

1.  **Locate Index:** Check for the existence of \`conductor/index.md\` in the project root.
    -   **If Missing:**
        -   Announce: *"Conductor is not initialized properly. I cannot find the \`conductor/index.md\` file."*
        -   Ask the user using a **Yes/No question** if they would like to run the setup process now to initialize Conductor.
        -   **If Approved:** Internally invoke the \`conductor-setup\` skill.
        -   **If Denied:** HALT and await further instructions.

2.  **Load & Verify Context:** Read \`conductor/index.md\` and use the provided links to locate the **Tracks Registry** file.
    -   If the link is missing or \`index.md\` doesn't exist, fallback to the default path: \`conductor/tracks.md\`.
    -   **Health Check:** You MUST verify that the **Tracks Registry** file exists and is not empty. If it is missing or empty, HALT execution and announce that no tracks are available to revert.

---

## 2. Interactive Target Selection & Confirmation
**GOAL: Guide the user to clearly identify and confirm the logical unit of work they want to revert before any analysis begins.**

1.  **Initiate Revert Process:** Your first action is to determine the user's target.

2.  **Check for a User-Provided Target:** First, check if the user provided a specific target as an argument (e.g., \`/conductor:revert track <track_id>\`).
    *   **IF a target is provided:** Proceed directly to the **Direct Confirmation Path (A)** below.
    *   **IF NO target is provided:** You MUST proceed to the **Guided Selection Menu Path (B)**. This is the default behavior.

3.  **Interaction Paths:**

    *   **PATH A: Direct Confirmation**
        1.  Find the specific track, phase, or task the user referenced in the **Tracks Registry** or **Implementation Plan** files. Resolve these files by checking \`conductor/index.md\` or track-level index files for links, otherwise use the **Default Paths** (e.g., \`conductor/tracks.md\`, \`conductor/tracks/<track_id>/plan.md\`).
        2.  Ask the user for confirmation using a **Yes/No question** to verify the selected target.
        3.  If "yes", establish this as the \`target_intent\` and proceed to Phase 2. If "no", ask an **open question** for them to describe the Track, Phase, or Task they would like to revert.

    *   **PATH B: Guided Selection Menu**
        1.  **Identify Revert Candidates:** Your primary goal is to find relevant items for the user to revert.
            *   **Scan All Plans:** You MUST read the **Tracks Registry** and every track's **Implementation Plan**. Resolve these by checking \`conductor/index.md\` or track-level index files for links, otherwise use the **Default Paths** (e.g., \`conductor/tracks.md\`, \`conductor/tracks/<track_id>/plan.md\`).
            *   **Prioritize In-Progress:** First, find the **top 3** most relevant Tracks, Phases, or Tasks marked as "in-progress" (\`[~]\`).
            *   **Fallback to Completed:** If and only if NO in-progress items are found, find the **3 most recently completed** Tasks and Phases (\`[x]\`).
        2.  **Present a Unified Hierarchical Menu:** Present the identified items to the user as a **single-choice question** (limiting to a maximum of 4 items) to let them choose what to revert.
        3.  **Process User's Choice:**
            *   If the user selects a specific item from the list, set this as the \`target_intent\` and proceed directly to Phase 2.
            *   If the user selects "Other", ask an **open question** to find the correct target, and then confirm it using Path A.
                * Once a target is identified, loop back to Path A for final confirmation.

4.  **Halt on Failure:** If no completed items are found to present as options, announce this and halt.

---

## 3. Git Reconciliation & Verification
**GOAL: Find ALL actual commit(s) in the Git history that correspond to the user's confirmed intent and analyze them.**

1.  **Identify Implementation Commits:**
    *   Find the primary SHA(s) for all tasks and phases recorded in the target's **Implementation Plan**.
    *   **Handle "Ghost" Commits (Rewritten History):** If a SHA from a plan is not found in Git, announce this. Search the Git log for a commit with a highly similar message and ask the user for confirmation using a **Yes/No question** to use it as the replacement. If not confirmed, halt.

2.  **Identify Associated Plan-Update Commits:**
    *   For each validated implementation commit, use \`git log\` to find the corresponding plan-update commit that happened *after* it and modified the relevant **Implementation Plan** file.

3.  **Identify the Track Creation Commit (Track Revert Only):**
    *   **IF** the user's intent is to revert an entire track, you MUST perform this additional step.
    *   **Method:** Use \`git log -- <path_to_tracks_registry>\` (resolved via protocol) and search for the commit that first introduced the track entry.
        *   Look for lines matching either \`- [ ] **Track: <Track Description>**\` (new format) OR \`## [ ] Track: <Track Description>\` (legacy format).
    *   Add this "track creation" commit's SHA to the list of commits to be reverted.

4.  **Compile and Analyze Final List:**
    *   Compile a final, comprehensive list of **all SHAs to be reverted**.
    *   For each commit in the final list, check for complexities like merge commits and warn about any cherry-pick duplicates.

---

## 4. Final Execution Plan Confirmation
**GOAL: Present a clear, final plan of action to the user before modifying anything.**

1.  **Summarize Findings:** Present a summary of your investigation and the exact actions you will take.
    > "I have analyzed your request. Here is the plan:"
    > *   **Target:** Revert Task '[Task Description]'.
    > *   **Commits to Revert:** 2
    > \`  - <sha_code_commit> ('feat: Add user profile')\`
    > \`  - <sha_plan_commit> ('conductor(plan): Mark task complete')\`

2.  **Choose Strategy:** Ask the user to choose the revert strategy using a **single-choice question** with options:
    - **Safe (Recommended)**: Use \`git revert\` to create new commits that undo the changes. This preserves history and is safe for shared branches.
    - **Hard Reset (Destructive)**: Use \`git reset --hard\` to remove commits from history. This will lose all uncommitted changes and rewritten history. **WARNING: This is destructive and should be used with caution.**

3.  **Process User Choice:**
    - If the user selects **Safe**, proceed to Section 5 and use \`git revert\`.
    - If the user selects **Hard Reset**, proceed to Section 5 and use \`git reset\`.
    - If the user selects **Revise**, ask the user an **open question** to describe the changes needed for the plan.

---

## 5. Execution & Verification
**GOAL: Execute the revert, verify the plan's state, and handle any runtime errors gracefully.**

1.  **Execute Reverts:**
    - **If Safe strategy selected**: Run \`git revert --no-edit <sha>\` for each commit in your final list, starting from the most recent and working backward.
    - **If Hard Reset strategy selected**:
        - **WARNING**: Ensure the user understands that this will destroy uncommitted changes.
        - Identify the commit *before* the earliest commit in your list to be reverted. Let's call it \`<base_sha>\`.
        - Run \`git reset --hard <base_sha>\`.
2.  **Handle Conflicts (Revert only):** If any revert command fails due to a merge conflict, halt and provide the user with clear instructions for manual resolution.
3.  **Verify Plan State:** After execution, read the relevant **Implementation Plan** file(s) again to ensure the reverted item has been correctly reset. If not, perform a file edit to fix it and commit the correction.
4.  **Announce Completion:** Inform the user that the process is complete and the plan is synchronized.
`
      },
      {
        sourcePath: "D:/conductor/src/internal/templates/data/skills/conductor-review/SKILL.md",
        category: "skills",
        subpath: "conductor-review",
        ext: ".md",
        content: `---
name: conductor-review
description: Reviews the completed track work against guidelines and the plan. Acts as a Principal Software Engineer to ensure quality and compliance.
metadata:
  version: "1.0"
---

# Conductor Review Skill

You are an AI agent acting as a **Principal Software Engineer** and **Code Review Architect**. Your goal is to review the implementation of a specific track or a set of changes against the project's standards, design guidelines, and the original plan.

**Persona:**
- You think from first principles.
- You are meticulous and detail-oriented.
- You prioritize correctness, maintainability, and security over minor stylistic nits (unless they violate strict style guides).
- You are helpful but firm in your standards.

## Operational Standards

-   **Precise Execution:** Do not skip steps. Do not make assumptions about the project state; always verify via the terminal.
-   **Tool Validation:** You MUST validate the success of every tool call. If a command fails, review the error, attempt to self-correct once, or halt and ask for guidance.
-   **Path Integrity:** Always use relative paths starting from the project root (e.g., \`conductor/tracks.md\`).
-   **Interaction Protocol:** When gathering information or asking for decisions, you MUST provide either **single-choice** or **multiple-choice** options based on context-aware suggestions. If a specific option is preferred based on project standards or best practices, list it first, prefix it with '(Recommended)', and provide a brief, context-rich explanation of why it is the better choice. You MUST always include a custom or "Other" option to allow user-defined input. Avoid asking raw, open-ended questions without suggestions.
-   **Sequential Questioning (CRITICAL):** When gathering information or asking the user questions, if a native tool is available to present multiple questions for structured answering (e.g., a modal or form tool), you may use it to group questions. However, if you are interacting via standard text chat, you MUST ask questions strictly one at a time and wait for the user's response before proceeding to the next question. Do NOT output multiple questions in a single chat response.

---

## 1. Handshake & Context Initialization

Before starting the review process, you MUST locate and read the project's foundational context.

1.  **Locate Index:** Check for the existence of \`conductor/index.md\` in the project root.
    -   **If Missing:**
        -   Announce: *"Conductor is not initialized properly. I cannot find the \`conductor/index.md\` file."*
        -   Ask the user using a **Yes/No question** if they would like to run the setup process now to initialize Conductor.
        -   **If Approved:** Internally invoke the \`conductor-setup\` skill.
        -   **If Denied:** HALT and await further instructions.

2.  **Load & Verify Context:** Read \`conductor/index.md\` and use the provided links to locate the core files:
    -   **Tracks Registry** (\`tracks.md\`)
    -   **Product Definition** (\`product.md\`)
    -   **Tech Stack** (\`tech-stack.md\`)
    -   **Workflow** (\`workflow.md\`)
    -   **Product Guidelines** (\`product-guidelines.md\`)
    -   **Health Check:** You MUST verify that every linked file actually exists. If ANY of these core files are missing, HALT immediately. Announce which file is missing and ask the user if they would like to run the setup process to repair the environment.

---

## 2. Review Protocol
**PROTOCOL: Follow this sequence to perform a code review.**

### 2.1 Identify Scope

1.  **Check for User Input:**
    -   Check if the user provided specific arguments or a track name for the review in their initial request.
    -   If arguments were provided, use them as the target scope.

2.  **Auto-Detect Scope:**
    -   If no input was provided, read the **Tracks Registry**.
    -   Look for a track marked as \`[~]\` (In Progress).
    -   **If one exists:** Ask the user for confirmation using a **Yes/No question** to proceed with reviewing that specific track.
    -   **If no track is in progress, or the user declines:** Ask the user to clarify what they would like to review by asking an **open question**, suggesting options like entering a specific track name or 'current' for uncommitted changes.

3.  **Confirm Scope:** Ensure you and the user agree on what is being reviewed by asking for confirmation using a **Yes/No question**.

### 2.2 Retrieve Context
1.  **Load Project Context:**
    -   Read \`product-guidelines.md\` and \`tech-stack.md\`.
    -   **CRITICAL:** Check for the existence of \`conductor/code_styleguides/\` directory.
        -   If it exists, list and read ALL \`.md\` files within it. These are the **Law**. Violations here are **High** severity.
    -   **Check for Installed Skills:**
        -   Check for the existence of \`.agents/skills/\` (Workspace tier) and \`~/.agents/extensions/conductor/skills/\` (Extension tier).
        -   If either exists, list the subdirectories to identify installed skills across both paths.
        -   If relevant skills (e.g., \`gcp-*\`) are found, enable specialized feedback for those domains.
2.  **Load Track Context (if reviewing a track):**
    -   Read the track's \`plan.md\`.
    -   **Extract Commits:** Parse \`plan.md\` to find recorded git commit hashes (usually in the "Completed" tasks or "History" section).
    -   **Determine Revision Range:** Identify the start (first commit parent) and end (last commit).
3.  **Load and Analyze Changes (Smart Chunking):**
    -   **Volume Check:** Run \`git diff --shortstat <revision_range> -- . ':!conductor'\` first.
    -   **Strategy Selection:**
        -   **Small/Medium Changes (< 300 lines):**
            -   Run \`git diff <revision_range> -- . ':!conductor'\` to get the full context in one go.
            -   Proceed to "Analyze and Verify".
        -   **Large Changes (> 300 lines):**
            -   **Confirm:** Ask the user for confirmation using a **Yes/No question** to proceed with a large review (explaining that it involves >300 lines of changes and will use 'Iterative Review Mode' which may take longer).
            -   **List Files:** Run \`git diff --name-only <revision_range> -- . ':!conductor'\`.
            -   **Iterate (Subagent Delegation, dispatch point):** This is a parallel-safe dispatch point \u2014 per-file diffs are independent of one another. Dispatch them in parallel using the native \`Task\` tool with \`subagent_type=general_purpose_task\`, **one subagent per source file** (ignore locks/assets). Each subagent runs \`git diff <revision_range> -- <file_path>\`, performs the "Analyze and Verify" checks (2.3) on that file only, and returns its findings in the Section 2.4 finding format; it **must not write any files**. The orchestrator **aggregates all findings** into the final report. If no native \`Task\` tool is available, fall back to iterating the files yourself, one at a time:
                1.  Run \`git diff <revision_range> -- <file_path>\`.
                2.  Perform the "Analyze and Verify" checks on this specific chunk.
                3.  Store findings in your temporary memory.
            -   **Aggregate:** Synthesize all file-level findings (yours or the subagents') into the final report.

### 2.3 Analyze and Verify
**Perform the following checks on the retrieved diff:**

1.  **Intent Verification:** Does the code actually implement what the \`plan.md\` (and \`spec.md\` if available) asked for?
2.  **Style Compliance:**
    -   Does it follow \`product-guidelines.md\`?
    -   Does it strictly follow \`conductor/code_styleguides/*.md\`?
3.  **Correctness & Safety:**
    -   Look for bugs, race conditions, null pointer risks.
    -   **Security Scan:** Check for hardcoded secrets, PII leaks, or unsafe input handling.
4.  **Testing:**
    -   Are there new tests?
    -   Do the changes look like they are covered by existing tests?
    -   *Action:* **Execute the test suite automatically.** Infer the test command based on the codebase languages and structure (e.g., \`npm test\`, \`pytest\`, \`go test\`). Run it. Analyze the output for failures.
5.  **Skill-Specific Checks:**
    -   If specific skills are installed (e.g. GCP), verify compliance with their best practices.

### 2.4 Output Findings
**Format your output strictly as follows:**

# Review Report: [Track Name / Context]

## Summary
[Single sentence description of the overall quality and readiness]

## Verification Checks
- [ ] **Plan Compliance**: [Yes/No/Partial] - [Comment]
- [ ] **Style Compliance**: [Pass/Fail]
- [ ] **New Tests**: [Yes/No]
- [ ] **Test Coverage**: [Yes/No/Partial]
- [ ] **Test Results**: [Passed/Failed] - [Summary of failing tests or 'All passed']

## Findings
*(Only include this section if issues are found)*

### [Critical/High/Medium/Low] Description of Issue
- **File**: \`path/to/file\` (Lines L<Start>-L<End>)
- **Context**: [Why is this an issue?]
- **Suggestion**:
\`\`\`diff
- old_code
+ new_code
\`\`\`

---

## 3. Completion Phase

### 3.1 Review Decision
1.  **Determine Recommendation and announce it to the user:**
    -   If **Critical** or **High** issues found:
        - Announce: "I recommend we fix the important issues I found before moving forward."
    -   If only **Medium/Low** issues found:
        - Announce: "The changes look good overall, but I have a few suggestions to improve them."
    -   If no issues found:
        - Announce: "Everything looks great! I don't see any issues."
2.  **Action:**
    -   **If issues found:** Ask the user how they would like to proceed with the findings using a **multiple-choice** question with the following options:
        -   **Apply Fixes:** Automatically apply the suggested code changes using file editing tools, then proceed to the next step.
        -   **Manual Fix:** Terminate operation to allow the user to edit the code themselves.
        -   **Complete Track:** Ignore warnings and proceed to the next step.
    -   **If no issues found:** Proceed to the next step.

### 3.2 Commit Review Changes
**PROTOCOL: Ensure all review-related changes are committed and tracked in the plan.**

1.  **Check for Changes:** Use \`git status --porcelain\` to check for any uncommitted changes (staged or unstaged) in the repository.
2.  **Condition for Action:**
    -   If NO changes are detected, proceed to '3.3 Track Cleanup'.
    -   If changes are detected:
        a. **Check for Track Context:**
            - If you are NOT reviewing a specific track (i.e., you don't have a \`plan.md\` in context), ask the user for confirmation using a **Yes/No question** if you should commit the detected uncommitted changes.
                - If 'yes', stage all changes and commit with \`fix(conductor): Apply review suggestions <brief description of changes>\`.
                - Proceed to '3.3 Track Cleanup'.
        b. **Handle Track-Specific Changes:**
            i.   **Confirm with User:** Ask the user for confirmation using a **Yes/No question** if you should commit the uncommitted changes and update the track's plan.
            ii.  **If Yes:**
                 - **Update Plan (Add Review Task):**
                   - Read the track's \`plan.md\`.
                   - Append a new phase (if it doesn't exist) and task to the end of the file.
                   - **Format:**
                     \`\`\`markdown
                     ## Phase: Review Fixes
                     - [~] Task: Apply review suggestions
                     \`\`\`
                 - **Commit Code:**
                   - Stage all code changes related to the track (excluding \`plan.md\`).
                   - Commit with message: \`fix(conductor): Apply review suggestions for track '<track_name>'\`.
                 - **Record SHA:**
                   - Get the short SHA (first 7 characters) of the commit.
                   - Update the task in \`plan.md\` to: \`- [x] Task: Apply review suggestions <sha>\`.
                 - **Commit Plan Update:**
                   - Stage \`plan.md\`.
                   - Commit with message: \`conductor(plan): Mark task 'Apply review suggestions' as complete\`.
                 - **Announce Success:** "Review changes committed and tracked in the plan."
            iii. **If No:** Skip the commit and plan update. Proceed to '3.3 Track Cleanup'.

### 3.3 Track Cleanup

1. **Context Check:** If you are NOT reviewing a specific track (e.g., just reviewing current changes without a track context), SKIP this entire section.

2. **Ask for User Choice:** Ask the user what they would like to do with the track using a **multiple-choice** question with the following options:
    - **Archive:** Move to \`conductor/archive/\` and remove from the tracks file.
    - **Delete:** Permanently delete folder and remove from the tracks file.
    - **Skip:** Do nothing and leave it in the tracks file.

3. **If the user chooses "Archive":**
    - Ensure \`conductor/archive/\` directory exists.
    - Move the track folder to \`conductor/archive/<track_id>/\`.
    - Remove the track section from the **Tracks Registry**.
    - Stage changes and commit with message: \`chore(conductor): Archive track '<track_name>'\`.
    - Announce to the user that the track has been archived.

4. **If the user chooses "Delete":**
    - Ask for final confirmation using a **Yes/No question**, including a warning that this is an irreversible deletion.
    - **If confirmed:** Delete the track folder, remove it from the **Tracks Registry**, and commit with message: \`chore(conductor): Delete track '<track_name>'\`.

5. **If the user chooses "Skip":** Leave the track as is.

---

## 4. Completion and Optional Handoff
Once the review process and any subsequent actions (fixes, commits, cleanup) are finished, announce the final status.

1.  **Final Report:** Summarize the review findings and any actions taken (e.g., "Review complete, fixes applied and committed").
2.  **Optional Revert Suggestion:** If the review reveals fundamental issues that cannot be easily fixed, ask the user if they would like to revert any specific unit of work (tasks or phases) identified during the review using a **Yes/No question**.
3.  **Internal Handoff (Optional):**
    - If the user explicitly asks to revert work, you MUST use the \`conductor-revert\` skill to guide them through the process.
    - Otherwise, inform the user they can use the \`conductor-status\` skill to see the current project overview, or use the \`conductor-revert\` skill manually if they decide to revert work later.`
      },
      {
        sourcePath: "D:/conductor/src/internal/templates/data/skills/conductor-setup/SKILL.md",
        category: "skills",
        subpath: "conductor-setup",
        ext: ".md",
        content: `---
name: conductor-setup
description: Scaffolds the project and sets up the Conductor environment. Use this whenever a project needs to be initialized or if the Conductor configuration is missing.
metadata:
  version: "1.1"
---

# Conductor Setup Skill

You are the **Conductor Architect**. Your goal is to initialize a project for Spec-Driven Development (SDD). This document is your operational protocol: adhere to it precisely and sequentially.

## Operational Standards

-   **Precise Execution:** Do not skip steps. Do not make assumptions about the project state; always verify via the terminal.
-   **Tool Validation:** You MUST validate the success of every tool call. If a command fails, review the error, attempt to self-correct once, or halt and ask for guidance.
-   **Path Integrity:** Always use relative paths starting from the project root (e.g., \`conductor/product.md\`).
-   **State Machine:** You act as a gatekeeper. Do not proceed to configuration until discovery is approved by the user.
-   **Strategic Transparency:** Before executing a tool call that creates or modifies crucial infrastructure (like \`workflow.md\`), you MUST explain its strategic value to the project. Don't just execute; act as a mentor guiding the user through the 'Why' behind the scaffolding.
-   **Interaction Protocol:** When gathering information or asking for decisions, you MUST provide either **single-choice** or **multiple-choice** options based on context-aware suggestions. If a specific option is preferred based on project standards or best practices, list it first, suffix it with '(Recommended: *<explanation>*)' providing a brief, context-rich explanation in italics inside the parentheses. You MUST always include a custom or "Other" option to allow user-defined input. Avoid asking raw, open-ended questions without suggestions. Example:
    -   Description of choice 1 (Recommended: *<Brief explanation of why it is the better choice>*)
    -   Description of choice 2
    -   Other (User-defined input)
-   **Mode Selection Protocol:** For Sections 2.1 through 2.4, give the user the choice between **Interactive Mode** and **Autogenerate Mode**.
    -   In **Greenfield projects**, use **Interactive Mode** to conduct interviews (always recommend this option), or **Autogenerate Mode** to draft standard best practices.
    -   In **Brownfield projects**, rely entirely on your initial deep codebase analysis to fulfill these sections. Only ask the user to clarify identified gaps in your inferred information.
    -   For both modes, all questions, responses and generated content should be based on the user's context of the product they want to build or work on.
-   **Project Root Constraint:** You MUST treat the current working directory as the project root. You MUST NOT attempt to create a new directory for the project or ask the user where to initialize it. All Conductor artifacts must be stored within a \`conductor/\` directory in the current project root. If you detect that the current directory is not suitable (e.g., a home directory), you MUST instruct the user to \`cd\` into their specific project folder before running setup.
-   **Sequential Questioning (CRITICAL):** When gathering information or asking the user questions, if a native tool is available to present multiple questions for structured answering (e.g., a modal or form tool), you may use it to group questions. However, if you are interacting via standard text chat, you MUST ask questions strictly one at a time and wait for the user's response before proceeding to the next question. Do NOT output multiple questions in a single chat response.

## 1. Project Audit & Initialization

Before starting the setup, you MUST determine the project's state by auditing
the directory.

### 1.1 Pre-Initialization Overview

Present a high-level overview to the user. Adapt the text to the user's stated intent (e.g., acknowledge if they specified a *new* project). Use clear, multi-line formatting.

Example (for a new project):
> "Welcome to Conductor. I will guide you through:
> 1. **Project Discovery:** Verifying this directory is ready for a new project.
> 2. **Product Definition:** Defining the vision and tech stack.
> 3. **Configuration:** Setting up code style guides and workflow.
> 4. **Track Generation:** Defining the first actionable track.
> 
> Let's get started!"

### 1.2 Audit Artifacts & Resumption Check

Run the automated directory resumption script: \`python3 scripts/resume.py\`

Read the returned JSON object from \`stdout\`. **Do NOT mention the script name or path to the user.**

- If \`setup_complete\` is \`true\`, announce that the project is already initialized and **HALT** execution.
- If partial setup exists, present a clean summary of what is complete and what is missing using human-readable artifact names (e.g., \`tech-stack.md\`). Do NOT use internal section numbers (e.g., avoid "Section 2.3").
- Identify the pending step from \`next_step\` (e.g., "Technology Stack") and advise that setup can be resumed from there.

## 2. Interactive Scaffolding & Context Gathering

Before any action or resumption jump, you MUST determine the project's maturity
and gather context sequentially.

1.  **Detect Project Maturity:** Classify as **Brownfield** (Existing) or
    **Greenfield** (New):

    -   **Brownfield Indicators:**
        -   Presence of dependency manifests (\`package.json\`, \`go.mod\`,
            \`requirements.txt\`, \`pom.xml\`, \`Cargo.toml\`).
        -   Presence of source code directories (\`src/\`, \`app/\`, \`lib/\`, \`bin/\`)
            containing code files.
        -   **Git Hygiene:** If a \`.git\` directory exists, execute \`git status
            --porcelain\`. Ignore changes within \`conductor/\`. If other
            uncommitted changes exist, notify the user: *"WARNING: You have
            uncommitted changes. Please commit or stash them before
            proceeding."* and classify as Brownfield.
    -   **Greenfield Condition:** Classify as Greenfield ONLY if:
        -   NONE of the primary "Brownfield Indicators" are found.
        -   The directory contains no application source code or dependency
            manifests (ignoring \`conductor/\`, a clean/newly initialized \`.git\`
            folder, and a \`README.md\`).

2.  **Execute Maturity Workflow:**

**If Brownfield:**

- **Request Permission:** Ask: *"A brownfield project has been detected. May I perform a read-only scan to analyze the architecture?"*
- **Efficient Scan:** Upon permission, analyze the project while minimizing token usage:
    - Use \`git ls-files\` to identify relevant files.
    - Respect \`.gitignore\` and \`.geminiignore\` patterns.
    - Ignore common heavy directories (\`node_modules\`, \`dist\`, \`build\`).
    - For files >1MB, read only the first and last 20 lines.
    - Analyze \`README.md\` and manifests (\`package.json\`, \`go.mod\`, etc.) to extract the Tech Stack and Architecture.

**If Greenfield:**

- **Initialize Git:** If no \`.git\` folder exists, run \`git init\`.
- **Project Goal:** Ask the user: *"What do you want to build?"*
- **Context Preservation:** Hold the user's response in your context as the **Initial Concept**.

3.  **RESUME CHECK (Fast-Forward):**
    - If partial setup artifacts exist, announce the setup progress using human-readable names (e.g., "Technology Stack (\`tech-stack.md\`)"). Do NOT refer to internal section numbers.
    - Do NOT ask the user to choose from a list of all setup steps or offer already completed steps.
    - Instead, announce that setup will resume at the step indicated by \`next_step\` (e.g., "Technology Stack") and ask confirmation using a **Yes/No question** if they are ready to proceed with that step.
    - Proactively jump to the selected step upon approval. If no setup artifacts exist, proceed sequentially from Product Definition.

### 2.1 Product Definition (\`product.md\`)

Help the user define the product's vision, starting with the **Initial Concept** (Greenfield) or code analysis (Brownfield).

1.  **Title & Description Refinement:** Present a proposed Project Title and a one-paragraph summary based on the gathered context. Ask the user using a **Yes/No question** if this captures their vision.
2.  **Determine Mode:** Once the base description is approved, ask the user to choose the creation mode using a **single-choice question** with options: **Interactive** (to conduct a batched interview of max 4 questions) or **Autogenerate** (to draft a standard guide).

**Confirmation & Refinement Loop:**

1. Present the drafted \`product.md\` content (including the refined summary) to the user.
2. Ask the user to choose how to proceed using a **single-choice question** with options: **Approve**, **Revise** (to suggest specific changes), or **Refine** (to ask more questions).
3. Once approved, create the \`conductor/\` directory (if missing) and write the final content to \`conductor/product.md\`.

### 2.2 Product Guidelines (\`product-guidelines.md\`)

Help the user define branding, voice, tone, and UX principles.

1. **Determine Mode:** Ask the user to choose a mode using a **single-choice question**: **Interactive** (to ask about prose style, voice, and UX) or **Autogenerate** (standard best practices).
2. **Confirmation & Refinement Loop:** Present the drafted content and ask the user to choose how to proceed using a **single-choice question** with options: **Approve**, **Revise**, or **Refine**.
3. **Action:** Once approved, write the final content to \`conductor/product-guidelines.md\`.

### 2.3 Technology Stack (\`tech-stack.md\`)

Define and document the project's technology stack.

1.  **Determine Mode:**
    -   **Greenfield:** Ask the user to choose a mode using a **single-choice question**: **Interactive** (to hand-pick components) or **Autogenerate** (to recommend a standard stack based on the project goal).
        -   **If Interactive:** Ask a series of **multiple-choice questions** to select:
            -   Programming Language(s)
            -   Backend Framework(s)
            -   Frontend Framework(s)
            -   Database
    -   **Brownfield:** State the technology stack inferred from the codebase analysis. Ask the user for confirmation using a **Yes/No question** if it is correct. If not, ask an **open question** for them to provide the correct stack.

2.  **Confirmation & Refinement Loop:** Present the drafted stack to the user. Offer a **single-choice question** with options: **Approve**, **Manual Edit**, or **Refine** (to ask more specific technical questions).

3.  **Action:** Once approved, write the final content to \`conductor/tech-stack.md\`.

### 2.4 Code Style Guides

Select and copy appropriate style guides from \`assets/code_styleguides/\` to the project root at \`conductor/code_styleguides/\`.

1. **Asset Constraint:** You MUST ONLY propose and copy guides from \`assets/code_styleguides/\`. Do NOT generate style rules from scratch.
2. **Recommendation:** Propose guides based on the Tech Stack confirmed in 2.3.
3. **Selection Mode:**
    - **Brownfield:** Propose matching guides and ask the user using a **Yes/No question** if additional ones are needed.
    - **Greenfield:** Present recommended guides or allow the user to hand-pick from the library using a **multiple-choice question**.
4. **Refinement:** Ask the user using a **Yes/No question** if they want to customize the selection or add rules. If yes:
    - Present a **multiple-choice question** to select additional style guides from the library in \`assets/code_styleguides/\`.
    - Ask an **open question** for the user to provide any specific custom rules to be added to the guides.
5. **Copy Action:** Execute the copy command once the selection is confirmed.

### 2.5 Workflow Configuration (\`workflow.md\`)

Configure the operational rules for the project.

1. **Mode Selection:** Ask the user to choose a mode using a **single-choice question** with options: **Default** or **Customize**.
2. **Customization Flow (If selected):** Conduct a batched interview using an **open question** (for coverage percentage) and **single-choice questions** (for commit frequency and summary storage).
3. **Explain:** Before copying, explain that the \`workflow.md\` defines the "rules of the game" for development, ensuring every task follows TDD and high-quality standards.
4. **Write Action:** Copy \`assets/workflow.md\` to \`conductor/workflow.md\` and apply user choices if customized.

### 2.6 Agent Skill Selection (Optional)

1. **Analyze Needs & Trust Model:**
    - Read the skill catalog from \`assets/catalog.md\` (relative to this skill's directory).
    - Analyze the project context (e.g., \`product.md\`, \`tech-stack.md\`) against the \`Detection Signals\` in the loaded \`catalog.md\` to identify relevant skills NOT yet installed.
    - **Trust Disclosure:** For each recommendation, disclose the \`Party\` status:
        - **1p (Official):** Present as a verified, official Conductor skill.
        - **3p (Community):** Present as a third-party skill. You MUST warn the user: *"Warning: This is a third-party skill. It will be installed as a frozen version (commit <sha>) for your safety."*

2. **Recommendation & Installation Loop:**
    - **Identify Recommendations:** If relevant missing skills are found, present them to the user, explaining their value for the project.
    - **Trust Disclosure:** For each recommendation, disclose its status:
        - **1p (Official):** Present as a verified Conductor skill.
        - **3p (Community):** Present as a third-party skill. You MUST warn the user: *"Attention: This is a third-party skill. It will be installed as a frozen version (commit <sha>) for your safety."*
    - **User Approval:** Ask the user to select which recommended skills they would like to install using a **multiple-choice question**.
    - **Execute Installation:** You MUST download the selected skill using exactly the following \`curl\` command sequence. Do not modify the parameters or add flags:
      
        \`\`\`bash
        mkdir -p .agents/skills/<skill_name>
        curl -sSL <URL>SKILL.md -o .agents/skills/<skill_name>/SKILL.md
        \`\`\`
    - **Verify:** Confirm that the skill folder has been successfully created in the local \`.agents/skills/\` directory.
    - **If no missing skills found:** Skip this section.

3. **Environment Synchronization:**
    - **Execution Trigger:** This step MUST only be executed if new skills were installed in the previous step.
    - **Notify and Pause:** Inform the user that new skills have been added to the project. Suggest that they ensure their agent's environment is refreshed or reloaded (as required by their specific tool) to recognize these new capabilities.
    - **Wait for Confirmation:** Pause your execution and wait for the user to confirm they are ready to proceed with the updated environment.

## 3. The Handshake (Index Generation)

Create \`conductor/index.md\`. This is the **Single Source of Truth** for all tools.

1.  **Explain:** Explain that the \`index.md\` is the "Handshake" of the project. It maps the entire infrastructure so that any tool or agent can instantly understand the project's context and standards.

2.  **Path Mapping:** Write the following exact structure, linking to the artifacts you created. Include the "Capabilities" section only if you installed agent skills: 

\`\`\`markdown

    # Project Context

    ## Definition

    -   [Product Definition](./product.md)
    -   [Product Guidelines](./product-guidelines.md)
    -   [Tech Stack](./tech-stack.md)

    ## Workflow

    -   [Workflow](./workflow.md)
    -   [Code Style Guides](./code_styleguides/)

    ## Capabilities

    -   [Agent Skills](../.agents/skills/)
\`\`\`

3.  **Integrity Check:** You MUST verify the existence of all linked files on disk.

4.  **Commit Stage:** Stage the entire \`conductor/\` directory. Create a commit with the message: \`conductor(setup): Initialize project context and standards\`.

## 4. Completion

Once the \`conductor/\` directory is created and the index is generated, announce that setup is complete.

**Next Steps:**

1. **Summary:** Present a final summary of the initialized scaffolding.
2.  **Proactive Suggestion:** Ask the user if they would like to start defining
    their next action using a **Yes/No question**:
    -   **Greenfield (New Project):** Ask if they want to start planning the
        initial product implementation (MVP) right now.
    -   **Brownfield (Existing Project):** Ask if they want to start defining
        their first actionable task (feature, bug fix, or chore) right now.
3. **Internal Handoff:** If the user agrees, you MUST use the \`conductor-new-track\` skill to begin planning.
`
      },
      {
        sourcePath: "D:/conductor/src/internal/templates/data/skills/conductor-setup/assets/catalog.md",
        category: "skills",
        subpath: "conductor-setup/assets",
        ext: ".md",
        content: `# Agent Skills Catalog

This catalog defines the curriculum of skills available to the Conductor
extension.

## Firebase Skills

Skills focused on setting up, managing, and using various Firebase services.

### firebase-ai-logic-basics

-   **Description**: Official skill for integrating Firebase AI Logic (Gemini
    API) into web applications. Covers setup, multimodal inference, structured
    output, and security.
-   **URL**:
    https://raw.githubusercontent.com/firebase/agent-skills/main/skills/firebase-ai-logic-basics/
-   **Party**: 1p
-   **Detection Signals**:
    -   **Dependencies**: \`firebase\`, \`firebase-admin\`
    -   **Keywords**: \`Firebase\`, \`AI Logic\`, \`Gemini API\`, \`GenAI\`

### firebase-app-hosting-basics

-   **Description**: Deploy and manage web apps with Firebase App Hosting. Use
    this skill when deploying Next.js/Angular apps with backends.
-   **URL**:
    https://raw.githubusercontent.com/firebase/agent-skills/main/skills/firebase-app-hosting-basics/
-   **Party**: 1p
-   **Detection Signals**:
    -   **Dependencies**: \`firebase\`, \`firebase-admin\`
    -   **Keywords**: \`Firebase App Hosting\`, \`Next.js\`, \`Angular\`

### firebase-auth-basics

-   **Description**: Guide for setting up and using Firebase Authentication. Use
    this skill when the user's app requires user sign-in, user management, or
    secure data access using auth rules.
-   **URL**:
    https://raw.githubusercontent.com/firebase/agent-skills/main/skills/firebase-auth-basics/
-   **Party**: 1p
-   **Detection Signals**:
    -   **Dependencies**: \`firebase\`, \`firebase-admin\`
    -   **Keywords**: \`Firebase Authentication\`, \`Auth\`, \`Sign-in\`

### firebase-basics

-   **Description**: Guide for setting up and using Firebase. Use this skill
    when the user is getting started with Firebase - setting up local
    environment, using Firebase for the first time, or adding Firebase to their
    app.
-   **URL**:
    https://raw.githubusercontent.com/firebase/agent-skills/main/skills/firebase-basics/
-   **Party**: 1p
-   **Detection Signals**:
    -   **Dependencies**: \`firebase\`, \`firebase-admin\`
    -   **Keywords**: \`Firebase\`, \`Setup\`

### firebase-data-connect-basics

-   **Description**: Build and deploy Firebase Data Connect backends with
    PostgreSQL. Use for schema design, GraphQL queries/mutations, authorization,
    and SDK generation for web, Android, iOS, and Flutter apps.
-   **URL**:
    https://raw.githubusercontent.com/firebase/agent-skills/main/skills/firebase-data-connect-basics/
-   **Party**: 1p
-   **Detection Signals**:
    -   **Dependencies**: \`firebase\`, \`firebase-admin\`
    -   **Keywords**: \`Firebase Data Connect\`, \`PostgreSQL\`, \`GraphQL\`

### firebase-firestore-basics

-   **Description**: Comprehensive guide for Firestore basics including
    provisioning, security rules, and SDK usage. Use this skill when the user
    needs help setting up Firestore, writing security rules, or using the
    Firestore SDK in their application.
-   **URL**:
    https://raw.githubusercontent.com/firebase/agent-skills/main/skills/firebase-firestore-basics/
-   **Party**: 1p
-   **Detection Signals**:
    -   **Dependencies**: \`firebase\`, \`firebase-admin\`
    -   **Keywords**: \`Firestore\`, \`Database\`, \`Security Rules\`

### firebase-hosting-basics

-   **Description**: Skill for working with Firebase Hosting (Classic). Use this
    when you want to deploy static web apps, Single Page Apps (SPAs), or simple
    microservices. Do NOT use for Firebase App Hosting.
-   **URL**:
    https://raw.githubusercontent.com/firebase/agent-skills/main/skills/firebase-hosting-basics/
-   **Party**: 1p
-   **Detection Signals**:
    -   **Dependencies**: \`firebase\`, \`firebase-admin\`
    -   **Keywords**: \`Firebase Hosting\`, \`Static Hosting\`

## DevOps Skills

Skills for designing, building, and managing CI/CD pipelines and infrastructure
on Google Cloud.

### cloud-deploy-pipelines

-   **Description**: Manage the entire lifecycle of Google Cloud Deploy, from
    designing and creating delivery pipelines to managing releases and debugging
    failures.
-   **URL**:
    https://raw.githubusercontent.com/gemini-cli-extensions/devops/main/skills/cloud-deploy-pipelines/
-   **Party**: 1p
-   **Detection Signals**:
    -   **Dependencies**: \`skaffold\`
    -   **Keywords**: \`Cloud Deploy\`, \`delivery pipeline\`, \`skaffold.yaml\`,
        \`clouddeploy.yaml\`

### gcp-cicd-deploy

-   **Description**: Assistant for deploying applications to Google Cloud,
    supporting Static Sites (GCS), Cloud Run (Buildpacks or Images), and GKE.
-   **URL**:
    https://raw.githubusercontent.com/gemini-cli-extensions/devops/main/skills/gcp-cicd-deploy/
-   **Party**: 1p
-   **Detection Signals**:
    -   **Dependencies**: \`gcloud\`
    -   **Keywords**: \`Cloud Run\`, \`GCS\`, \`Static Site\`, \`Deployment\`, \`Google
        Cloud\`

### gcp-cicd-design

-   **Description**: Assistant for designing, building, and managing CI/CD
    pipelines on Google Cloud, focusing on architectural design and
    implementation planning.
-   **URL**:
    https://raw.githubusercontent.com/gemini-cli-extensions/devops/main/skills/gcp-cicd-design/
-   **Party**: 1p
-   **Detection Signals**:
    -   **Keywords**: \`CI/CD\`, \`Pipeline Design\`, \`Google Cloud\`, \`Architectural
        Design\`

### gcp-cicd-terraform

-   **Description**: Use Terraform to provision Google Cloud resources (GKE,
    Cloud Run, Cloud SQL) with standard GCS backend state management and IAM
    least-privilege.
-   **URL**:
    https://raw.githubusercontent.com/gemini-cli-extensions/devops/main/skills/gcp-cicd-terraform/
-   **Party**: 1p
-   **Detection Signals**:
    -   **Dependencies**: \`terraform\`
    -   **Keywords**: \`Terraform\`, \`GCP\`, \`GCS Backend\`, \`Infrastructure as
        Code\`, \`IaC\`
`
      },
      {
        sourcePath: "D:/conductor/src/internal/templates/data/skills/conductor-setup/assets/code_styleguides/cpp.md",
        category: "skills",
        subpath: "conductor-setup/assets/code_styleguides",
        ext: ".md",
        content: `# Google C++ Style Guide Summary

## 1. Naming

-   **General:** Optimize for readability. Be descriptive but concise. Use
    inclusive language.
-   **Files:** \`.h\` (headers), \`.cc\` (source). Lowercase with underscores (\`_\`)
    or dashes (\`-\`). Be consistent.
-   **Types:** PascalCase (\`MyClass\`, \`MyEnum\`). Use \`int\` by default; use
    \`<cstdint>\` (\`int32_t\`) if size matters.
-   **Concepts:** PascalCase (\`MyConcept\`).
-   **Variables:** snake_case (\`my_var\`). Class members end with underscore
    (\`my_member_\`), struct members do not.
-   **Constants/Enumerators:** \`k\` + PascalCase (\`kDays\`, \`kOk\`).
-   **Template Parameters:** PascalCase for types (\`T\`, \`MyType\`),
    snake_case/kPascalCase for non-types (\`N\`, \`kLimit\`).
-   **Functions:** PascalCase (\`GetValue()\`).
-   **Accessors/Mutators:** snake_case. \`count()\` (not \`GetCount\`),
    \`set_count(v)\`.
-   **Namespaces:** lowercase (\`web_search\`).
-   **Macros:** ALL_CAPS (\`MY_MACRO\`).

## 2. Header Files

-   **General:** Every \`.cc\` usually has a \`.h\`. Headers must be self-contained.
-   **Guards:** Use \`#define <PROJECT>_<PATH>_<FILE>_H_\`.
-   **IWYU:** Direct includes only. Do not rely on transitive includes.
-   **Forward Decls:** Avoid. Include headers instead. **Never** forward declare
    \`std::\` symbols.
-   **Inline Definitions:** Only short functions (<10 lines) in headers. Must be
    ODR-safe (\`inline\` or templates).
-   **Include Order:**
    1.  Related header (\`foo.h\`)
    2.  C system (\`<unistd.h>\`)
    3.  C++ standard (\`<vector>\`)
    4.  Other libraries (\`<Python.h>\`)
    5.  Project headers (\`"base/logging.h"\`) *Separate groups with blank lines.
        Alphabetical within groups.*

## 3. Formatting

-   **Indentation:** 2 spaces. **Line Length:** 80 chars.
-   **Non-ASCII:** Rare, use UTF-8. Avoid \`u8\` prefix if possible.
-   **Braces:** \`if (cond) { ... }\`. **Exception:** Function definition open
    brace goes on the **next line**.
-   **Switch:** Always include \`default\`. Use \`[[fallthrough]]\` for explicit
    fallthrough.
-   **Literals:** Floating-point must have radix point (\`1.0f\`).
-   **Calls:** Wrap arguments at paren or 4-space indent.
-   **Init Lists:** Colon on new line, indent 4 spaces.
-   **Namespaces:** No indentation.
-   **Vertical Whitespace:** Use sparingly. Separate related chunks, not code
    blocks.
-   **Loops/Branching:** Use braces (optional if single line). No space after
    \`(\`, space before \`{\`.
-   **Return:** No parens \`return result;\`.
-   **Preprocessor:** \`#\` always at line start.
-   **Pointers:** \`char* c\` (attached to type).
-   **Templates:** No spaces inside \`< >\` (\`vector<int>\`).
-   **Operators:** Space around assignment/binary, no space for unary.
-   **Class Order:** \`public\`, \`protected\`, \`private\`.
-   **Parameter Wrapping:** Wrap parameter lists that don't fit. Use 4-space
    indent for wrapped parameters.

## 4. Classes

-   **Constructors:** \`explicit\` for single-arg and conversion operators.
    **Exception:** \`std::initializer_list\`. No virtual calls in ctors. Use
    factories for fallible init.
-   **Structs:** Only for passive data. Prefer \`struct\` over \`std::pair\` or
    \`std::tuple\`.
-   **Copy/Move:** Explicitly \`= default\` or \`= delete\`. **Rule of 5:** If
    defining one, declare all.
-   **Inheritance:** \`public\` only. Composition > Inheritance. Use \`override\`
    (omit \`virtual\`). No multiple implementation inheritance.
-   **Operator Overloading:** Judicious use only. Binary ops as non-members.
    Never overload \`&&\`, \`||\`, \`,\`, or unary \`&\`. No User-Defined Literals.
-   **Access:** Data members \`private\` (except structs/constants).
-   **Declaration Order:** \`public\` before \`protected\` before \`private\`. Within
    sections: Types, Constants, Factory, Constructors, Destructor, Methods, Data
    Members.

## 5. Functions

-   **Params:** Inputs (\`const T&\`, \`std::string_view\`, \`std::span\` or value)
    first, then outputs. **Ordering:** Inputs before outputs.
-   **Outputs:** Prefer return values/\`std::optional\`. For non-optional outputs,
    use references. For optional outputs, use pointers.
-   **Optional Inputs:** Use \`std::optional\` for by-value, \`const T*\` for
    reference.
-   **Nonmember vs Static:** Prefer nonmember functions in namespaces over
    static member functions.
-   **Length:** Prefer small (<40 lines).
-   **Overloading:** Use only when behavior is obvious. Document overload sets
    with a single umbrella comment.
-   **Default Args:** Allowed on non-virtual functions only (value must be
    fixed/constant).
-   **Trailing Return:** Only when necessary (lambdas).

## 6. Scoping

-   **Namespaces:** No \`using namespace\`. Use \`using std::string\`. Never add to
    \`namespace std\`.
-   **Internal:** Use anonymous namespaces or \`static\` in \`.cc\` files. Avoid in
    headers.
-   **Locals:** Narrowest scope. Initialize at declaration. **Exception:**
    Declare complex objects outside loops.
-   **Static/Global:** Must be **trivially destructible** (e.g., \`constexpr\`,
    raw pointers, arrays). No global \`std::string\`, \`std::map\`, smart pointers.
    Dynamic initialization allowed only for function-static variables.
-   **Thread Local:** \`thread_local\` must be \`constinit\` if global. Prefer
    \`thread_local\` over other mechanisms.

## 7. Modern C++ Features

-   **Version:** Target **C++20**. Do not use C++23. Consider portability for
    C++17/20 features. No non-standard extensions.
-   **Modules:** Do not use C++20 Modules.
-   **Coroutines:** Use approved libraries only. Do not roll your own promise or
    awaitable types.
-   **Concepts:** Prefer C++20 Concepts (\`requires\`) over \`std::enable_if\`. Use
    \`requires(Concept<T>)\`, not \`template<Concept T>\`.
-   **R-Value References:** Use only for move ctors/assignment, perfect
    forwarding, or consuming \`*this\`.
-   **Smart Pointers:** \`std::unique_ptr\` (exclusive), \`std::shared_ptr\`
    (shared). No \`std::auto_ptr\`.
-   **Auto:** Use when type is obvious (\`make_unique\`, iterators). Avoid for
    public APIs.
-   **CTAD:** Use only if explicitly supported (deduction guides exist).
-   **Structured Bindings:** Use for pairs/tuples. Comment aliased field names.
-   **Nullptr:** Use \`nullptr\`, never \`NULL\` or \`0\`.
-   **Constexpr:** Use \`constexpr\`/\`consteval\` for constants/functions whenever
    possible. Use \`constinit\` for static initialization.
-   **Noexcept:** Specify when useful/correct. Prefer unconditional \`noexcept\`
    if exceptions are disabled.
-   **Lambdas:** Prefer explicit captures (\`[&x]\`) if escaping scope. Avoid
    \`std::bind\`.
-   **Initialization:** Prefer brace init. **Designated Initializers:** Allowed
    (C++20 ordered form only).
-   **Casts:** Use C++ casts (\`static_cast\`). Use \`std::bit_cast\` for type
    punning.
-   **Loops:** Prefer range-based \`for\`.

## 8. Best Practices

-   **Const:** Mark methods/variables \`const\` whenever possible. \`const\` methods
    must be thread-safe.
-   **Exceptions:** **Forbidden**.
-   **RTTI:** Avoid \`dynamic_cast\`/\`typeid\`. Allowed in unit tests. Do not
    hand-implement workarounds.
-   **Macros:** Avoid. Use \`constexpr\`/\`inline\`. If needed, define close to use
    and \`#undef\` immediately. Do not define in headers.
-   **0 and nullptr:** Use \`nullptr\` for pointers, \`\\0\` for chars, not \`0\`.
-   **Streams:** Use streams primarily for logging. Prefer printf-style
    formatting or absl::StrCat.
-   **Types:** Avoid \`unsigned\` for non-negativity. No \`long double\`.
-   **Pre-increment:** Prefer \`++i\` over \`i++\`.
-   **Sizeof:** Prefer \`sizeof(varname)\` over \`sizeof(type)\`.
-   **Friends:** Allowed, usually defined in the same file.
-   **Boost:** Use only approved libraries (e.g., Call Traits, Compressed Pair,
    BGL, Property Map, Iterator, etc.).
-   **Aliases:** Use \`using\` instead of \`typedef\`. Public aliases must be
    documented.
-   **Ownership:** Single fixed owner. Transfer via smart pointers.
-   **Aliases:** Document intent. Don't use in public API for convenience.
    \`using\` > \`typedef\`.
-   **Switch:** Always include \`default\`. Use \`[[fallthrough]]\` for explicit
    fallthrough.
-   **Comments:** Document File, Class, Function (params/return). Use \`//\` or
    \`/* */\`. Implementation comments for tricky code. \`TODO(user):\` format.

**BE CONSISTENT.** Follow existing code style.

*Source:
[Google C++ Style Guide](https://google.github.io/styleguide/cppguide.html)*
`
      },
      {
        sourcePath: "D:/conductor/src/internal/templates/data/skills/conductor-setup/assets/code_styleguides/csharp.md",
        category: "skills",
        subpath: "conductor-setup/assets/code_styleguides",
        ext: ".md",
        content: `# Google C# Style Guide Summary

This document summarizes key rules and best practices from the Google C# Style
Guide.

## 1. Naming Conventions

-   **PascalCase:** For class names, method names, constants, properties,
    namespaces, and public fields.
    -   Example: \`MyClass\`, \`GetValue()\`, \`MaxValue\`
-   **_camelCase:** For private, internal, and protected fields (with leading
    underscore).
    -   Example: \`_myField\`, \`_internalState\`
-   **camelCase:** For local variables and parameters.
    -   Example: \`localVariable\`, \`methodParameter\`
-   **Interfaces:** Prefix with \`I\` (e.g., \`IMyInterface\`).
-   **Type Parameters:** Use descriptive names prefixed with \`T\` (e.g.,
    \`TValue\`, \`TKey\`), or just \`T\` for simple cases.

## 2. Formatting Rules

-   **Indentation:** Use 2 spaces (never tabs).
-   **Braces:** K&R style\u2014no line break before the opening brace; keep \`} else\`
    on one line; braces required even when optional. \`csharp if (condition) {
    DoSomething(); } else { DoSomethingElse(); }\`
-   **Line Length:** Column limit 100.
-   **One Statement Per Line:** Each statement on its own line.

## 3. Declaration Order

Class member ordering: - Group members in this order: 1. Nested classes, enums,
delegates, and events 2. Static, const, and readonly fields 3. Fields and
properties 4. Constructors and finalizers 5. Methods - Within each group, order
by accessibility: 1. Public 2. Internal 3. Protected internal 4. Protected 5.
Private - Where possible, group interface implementations together.

## 4. Language Features

-   **var:** Use of \`var\` is encouraged if it aids readability by avoiding type
    names that are noisy, obvious, or unimportant. Prefer explicit types when it
    improves clarity. \`csharp var apple = new Apple(); // Good - type is obvious
    bool success = true; // Preferred over var for basic types\`
-   **Expression-bodied Members:** Use sparingly for simple properties and
    lambdas; don't use on method definitions. \`csharp public int Age => _age; //
    Methods: prefer block bodies.\`
-   **String Interpolation:** In general, use whatever is easiest to read,
    particularly for logging and assert messages.
    -   Be aware that chained \`operator+\` concatenations can be slower and cause
        memory churn.
    -   If performance is a concern, \`StringBuilder\` can be faster for multiple
        concatenations. \`csharp var message = $"Hello, {name}!";\`
-   **Collection Initializers:** Use collection and object initializers when
    appropriate. \`csharp var list = new List<int> { 1, 2, 3 };\`
-   **Null-conditional Operators:** Use \`?.\` and \`??\` to simplify null checks.
    \`csharp var length = text?.Length ?? 0;\`
-   **Pattern Matching:** Use pattern matching for type checks and casts.
    \`csharp if (obj is string str) { /* use str */ }\`

## 5. Best Practices

-   **Structs vs Classes**:
    -   Almost always use a class.
    -   Consider structs only for small, value-like types that are short-lived
        or frequently embedded.
    -   Performance considerations may justify deviations from this guidance.
-   **Access Modifiers:** Always explicitly declare access modifiers (don't rely
    on defaults).
-   **Ordering Modifiers:** Use standard order: \`public protected internal
    private new abstract virtual override sealed static readonly extern unsafe
    volatile async\`.
-   **Namespace Imports:** Place \`using\` directives at the top of the file
    (outside namespaces); \`System\` first, then alphabetical.
-   **Constants:** Always make variables \`const\` when possible; if not, use
    \`readonly\`. Prefer named constants over magic numbers.
-   **IEnumerable vs IList vs IReadOnlyList:** When method inputs are intended
    to be immutable, prefer the most restrictive collection type possible (e.g.,
    IEnumerable, IReadOnlyList); for return values, prefer IList when
    transferring ownership of a mutable collection, and otherwise prefer the
    most restrictive option.
-   **Array vs List:** Prefer \`List<>\` for public variables, properties, and
    return types. Use arrays when size is fixed and known at construction time,
    or for multidimensional arrays.
-   **Extension Methods:** Only use when the source is unavailable or changing
    it is infeasible. Only for core, general features. Be aware they obfuscate
    code.
-   **LINQ:** Use LINQ for readability, but be mindful of performance in hot
    paths.

## 6. File Organization

-   **One Class Per File:** Typically one class, interface, enum, or struct per
    file.
-   **File Name:** Prefer the file name to match the name of the primary type it
    contains.
-   **Folders and File Locations:**
    -   Be consistent within the project.
    -   Prefer a flat folder structure where possible.
    -   Don\u2019t force file/folder layout to match namespaces.
-   **Namespaces:**
    -   In general, namespaces should be no more than 2 levels deep.
    -   For shared library/module code, use namespaces.
    -   For leaf application code, namespaces are not necessary.
    -   New top-level namespace names must be globally unique and recognizable.

## 7. Parameters and Returns

-   **out Parameters:** Permitted for output-only values; place \`out\` parameters
    after all other parameters. Prefer tuples or return types when they improve
    clarity.
-   **Argument Clarity:** When argument meaning is nonobvious, use named
    constants, replace \`bool\` with \`enum\`, use named arguments, or create a
    configuration class/struct. \`\`\`csharp // Bad DecimalNumber product =
    CalculateProduct(values, 7, false, null);

    // Good var options = new ProductOptions { PrecisionDecimals = 7, UseCache =
    CacheUsage.DontUseCache }; DecimalNumber product = CalculateProduct(values,
    options, completionDelegate: null); \`\`\`

**BE CONSISTENT.** When editing code, follow the existing style in the codebase.

*Source:
[Google C# Style Guide](https://google.github.io/styleguide/csharp-style.html)*
`
      },
      {
        sourcePath: "D:/conductor/src/internal/templates/data/skills/conductor-setup/assets/code_styleguides/dart.md",
        category: "skills",
        subpath: "conductor-setup/assets/code_styleguides",
        ext: ".md",
        content: `# Dart Code Style Guide

This guide summarizes key recommendations from the official Effective Dart
documentation, covering style, documentation, language usage, and API design
principles. Adhering to these guidelines promotes consistent, readable, and
maintainable Dart code.

## 1. Style

### 1.1. Identifiers

-   **DO** name types, extensions, and enum types using \`UpperCamelCase\`.
-   **DO** name packages, directories, and source files using
    \`lowercase_with_underscores\`.
-   **DO** name import prefixes using \`lowercase_with_underscores\`.
-   **DO** name other identifiers (class members, top-level definitions,
    variables, parameters) using \`lowerCamelCase\`.
-   **PREFER** using \`lowerCamelCase\` for constant names.
-   **DO** capitalize acronyms and abbreviations longer than two letters like
    words (e.g., \`Http\`, \`Nasa\`, \`Uri\`). Two-letter acronyms (e.g., \`ID\`, \`TV\`,
    \`UI\`) should remain capitalized.
-   **PREFER** using wildcards (\`_\`) for unused callback parameters in anonymous
    and local functions.
-   **DON'T** use a leading underscore for identifiers that aren't private.
-   **DON'T** use prefix letters (e.g., \`kDefaultTimeout\`).
-   **DON'T** explicitly name libraries using the \`library\` directive.

### 1.2. Ordering

-   **DO** place \`dart:\` imports before other imports.
-   **DO** place \`package:\` imports before relative imports.
-   **DO** specify exports in a separate section after all imports.
-   **DO** sort sections alphabetically.

### 1.3. Formatting

-   **DO** format your code using \`dart format\`.
-   **CONSIDER** changing your code to make it more formatter-friendly (e.g.,
    shortening long identifiers, simplifying nested expressions).
-   **PREFER** lines 80 characters or fewer.
-   **DO** use curly braces for all flow control statements (\`if\`, \`for\`,
    \`while\`, \`do\`, \`try\`, \`catch\`, \`finally\`).

## 2. Documentation

### 2.1. Comments

-   **DO** format comments like sentences (capitalize the first word, end with a
    period).
-   **DON'T** use block comments (\`/* ... */\`) for documentation; use \`//\` for
    regular comments.

### 2.2. Doc Comments

-   **DO** use \`///\` doc comments to document members and types.
-   **PREFER** writing doc comments for public APIs.
-   **CONSIDER** writing a library-level doc comment.
-   **CONSIDER** writing doc comments for private APIs.
-   **DO** start doc comments with a single-sentence summary.
-   **DO** separate the first sentence of a doc comment into its own paragraph.
-   **AVOID** redundancy with the surrounding context (e.g., don't repeat the
    class name in its doc comment).
-   **PREFER** starting comments of a function or method with third-person verbs
    if its main purpose is a side effect (e.g., "Connects to...").
-   **PREFER** starting a non-boolean variable or property comment with a noun
    phrase (e.g., "The current day...").
-   **PREFER** starting a boolean variable or property comment with "Whether"
    followed by a noun or gerund phrase (e.g., "Whether the modal is...").
-   **PREFER** a noun phrase or non-imperative verb phrase for a function or
    method if returning a value is its primary purpose.
-   **DON'T** write documentation for both the getter and setter of a property.
-   **PREFER** starting library or type comments with noun phrases.
-   **CONSIDER** including code samples in doc comments using triple backticks.
-   **DO** use square brackets (\`[]\`) in doc comments to refer to in-scope
    identifiers (e.g., \`[StateError]\`, \`[anotherMethod()]\`, \`[Duration.inDays]\`,
    \`[Point.new]\`).
-   **DO** use prose to explain parameters, return values, and exceptions.
-   **DO** put doc comments before metadata annotations.

### 2.3. Markdown

-   **AVOID** using markdown excessively.
-   **AVOID** using HTML for formatting.
-   **PREFER** backtick fences (\`\`\`) for code blocks.

### 2.4. Writing

-   **PREFER** brevity.
-   **AVOID** abbreviations and acronyms unless they are obvious.
-   **PREFER** using "this" instead of "the" to refer to a member's instance.

## 3. Usage

### 3.1. Libraries

-   **DO** use strings in \`part of\` directives.
-   **DON'T** import libraries that are inside the \`src\` directory of another
    package.
-   **DON'T** allow an import path to reach into or out of \`lib\`.
-   **PREFER** relative import paths when not crossing the \`lib\` boundary.

### 3.2. Null Safety

-   **DON'T** explicitly initialize variables to \`null\`.
-   **DON'T** use an explicit default value of \`null\`.
-   **DON'T** use \`true\` or \`false\` in equality operations (e.g., \`if
    (nonNullableBool == true)\`).
-   **AVOID** \`late\` variables if you need to check whether they are
    initialized; prefer nullable types.
-   **CONSIDER** type promotion or null-check patterns for using nullable types.

### 3.3. Strings

-   **DO** use adjacent strings to concatenate string literals.
-   **PREFER** using interpolation (\`$variable\`, \`\${expression}\`) to compose
    strings and values.
-   **AVOID** using curly braces in interpolation when not needed (e.g.,
    \`'$name'\` instead of \`'\${name}'\`).

### 3.4. Collections

-   **DO** use collection literals (\`[]\`, \`{}\`, \`<type>{}\`) when possible.
-   **DON'T** use \`.length\` to check if a collection is empty; use \`.isEmpty\` or
    \`.isNotEmpty\`.
-   **AVOID** using \`Iterable.forEach()\` with a function literal; prefer
    \`for-in\` loops.
-   **DON'T** use \`List.from()\` unless you intend to change the type of the
    result; prefer \`.toList()\`.
-   **DO** use \`whereType()\` to filter a collection by type.
-   **AVOID** using \`cast()\` when a nearby operation (like \`List<T>.from()\` or
    \`map<T>()\`) will do.

### 3.5. Functions

-   **DO** use a function declaration to bind a function to a name.
-   **DON'T** create a lambda when a tear-off will do (e.g.,
    \`list.forEach(print)\` instead of \`list.forEach((e) => print(e))\`).

### 3.6. Variables

-   **DO** follow a consistent rule for \`var\` and \`final\` on local variables
    (either \`final\` for non-reassigned and \`var\` for reassigned, or \`var\` for
    all locals).
-   **AVOID** storing what you can calculate (e.g., don't store \`area\` if you
    have \`radius\`).

### 3.7. Members

-   **DON'T** wrap a field in a getter and setter unnecessarily.
-   **PREFER** using a \`final\` field to make a read-only property.
-   **CONSIDER** using \`=>\` for simple members (getters, setters,
    single-expression methods).
-   **DON'T** use \`this.\` except to redirect to a named constructor or to avoid
    shadowing.
-   **DO** initialize fields at their declaration when possible.

### 3.8. Constructors

-   **DO** use initializing formals (\`this.field\`) when possible.
-   **DON'T** use \`late\` when a constructor initializer list will do.
-   **DO** use \`;\` instead of \`{}\` for empty constructor bodies.
-   **DON'T** use \`new\`.
-   **DON'T** use \`const\` redundantly in constant contexts.

### 3.9. Error Handling

-   **AVOID** \`catch\` clauses without \`on\` clauses.
-   **DON'T** discard errors from \`catch\` clauses without \`on\` clauses.
-   **DO** throw objects that implement \`Error\` only for programmatic errors.
-   **DON'T** explicitly catch \`Error\` or types that implement it.
-   **DO** use \`rethrow\` to rethrow a caught exception to preserve the original
    stack trace.

### 3.10. Asynchrony

-   **PREFER** \`async\`/\`await\` over using raw \`Future\`s.
-   **DON'T** use \`async\` when it has no useful effect.
-   **CONSIDER** using higher-order methods to transform a stream.
-   **AVOID** using \`Completer\` directly.

## 4. API Design

### 4.1. Names

-   **DO** use terms consistently.
-   **AVOID** abbreviations unless more common than the unabbreviated term.
-   **PREFER** putting the most descriptive noun last (e.g., \`pageCount\`).
-   **CONSIDER** making the code read like a sentence when using the API.
-   **PREFER** a noun phrase for a non-boolean property or variable.
-   **PREFER** a non-imperative verb phrase for a boolean property or variable
    (e.g., \`isEnabled\`, \`canClose\`).
-   **CONSIDER** omitting the verb for a named boolean parameter (e.g.,
    \`growable: true\`).
-   **PREFER** the "positive" name for a boolean property or variable (e.g.,
    \`isConnected\` over \`isDisconnected\`).
-   **PREFER** an imperative verb phrase for a function or method whose main
    purpose is a side effect (e.g., \`list.add()\`, \`window.refresh()\`).
-   **PREFER** a noun phrase or non-imperative verb phrase for a function or
    method if returning a value is its primary purpose (e.g.,
    \`list.elementAt(3)\`).
-   **CONSIDER** an imperative verb phrase for a function or method if you want
    to draw attention to the work it performs (e.g., \`database.downloadData()\`).
-   **AVOID** starting a method name with \`get\`.
-   **PREFER** naming a method \`to___()\` if it copies the object's state to a
    new object (e.g., \`toList()\`).
-   **PREFER** naming a method \`as___()\` if it returns a different
    representation backed by the original object (e.g., \`asMap()\`).
-   **AVOID** describing the parameters in the function's or method's name.
-   **DO** follow existing mnemonic conventions when naming type parameters
    (e.g., \`E\` for elements, \`K\`, \`V\` for map keys/values, \`T\`, \`S\`, \`U\` for
    general types).

### 4.2. Libraries

-   **PREFER** making declarations private (\`_\`).
-   **CONSIDER** declaring multiple classes in the same library if they
    logically belong together.

### 4.3. Classes and Mixins

-   **AVOID** defining a one-member abstract class when a simple function
    (\`typedef\`) will do.
-   **AVOID** defining a class that contains only static members; prefer
    top-level functions/variables or a library.
-   **AVOID** extending a class that isn't intended to be subclassed.
-   **DO** use class modifiers (e.g., \`final\`, \`interface\`, \`sealed\`) to control
    if your class can be extended.
-   **AVOID** implementing a class that isn't intended to be an interface.
-   **DO** use class modifiers to control if your class can be an interface.
-   **PREFER** defining a pure mixin or pure class to a \`mixin class\`.

### 4.4. Constructors

-   **CONSIDER** making your constructor \`const\` if the class supports it (all
    fields are \`final\` and initialized in the constructor).

### 4.5. Members

-   **PREFER** making fields and top-level variables \`final\`.
-   **DO** use getters for operations that conceptually access properties (no
    arguments, returns a result, no user-visible side effects, idempotent).
-   **DO** use setters for operations that conceptually change properties
    (single argument, no result, changes state, idempotent).
-   **DON'T** define a setter without a corresponding getter.
-   **AVOID** using runtime type tests to fake overloading.
-   **AVOID** public \`late final\` fields without initializers.
-   **AVOID** returning nullable \`Future\`, \`Stream\`, and collection types;
    prefer empty containers or non-nullable futures of nullable types.
-   **AVOID** returning \`this\` from methods just to enable a fluent interface;
    prefer method cascades.

### 4.6. Types

-   **DO** type annotate variables without initializers.
-   **DO** type annotate fields and top-level variables if the type isn't
    obvious.
-   **DON'T** redundantly type annotate initialized local variables.
-   **DO** annotate return types on function declarations.
-   **DO** annotate parameter types on function declarations.
-   **DON'T** annotate inferred parameter types on function expressions.
-   **DON'T** type annotate initializing formals.
-   **DO** write type arguments on generic invocations that aren't inferred.
-   **DON'T** write type arguments on generic invocations that are inferred.
-   **AVOID** writing incomplete generic types.
-   **DO** annotate with \`dynamic\` instead of letting inference fail silently.
-   **PREFER** signatures in function type annotations.
-   **DON'T** specify a return type for a setter.
-   **DON'T** use the legacy \`typedef\` syntax.
-   **PREFER** inline function types over \`typedef\`s.
-   **PREFER** using function type syntax for parameters.
-   **AVOID** using \`dynamic\` unless you want to disable static checking.
-   **DO** use \`Future<void>\` as the return type of asynchronous members that do
    not produce values.
-   **AVOID** using \`FutureOr<T>\` as a return type.

### 4.7. Parameters

-   **AVOID** positional boolean parameters.
-   **AVOID** optional positional parameters if the user may want to omit
    earlier parameters.
-   **AVOID** mandatory parameters that accept a special "no argument" value.
-   **DO** use inclusive start and exclusive end parameters to accept a range.

### 4.8. Equality

-   **DO** override \`hashCode\` if you override \`==\`.
-   **DO** make your \`==\` operator obey the mathematical rules of equality
    (reflexive, symmetric, transitive, consistent).
-   **AVOID** defining custom equality for mutable classes.
-   **DON'T** make the parameter to \`==\` nullable.

*Sources:*

-   [Effective Dart: Style](https://dart.dev/effective-dart/style)
-   [Effective Dart: Documentation](https://dart.dev/effective-dart/documentation)
-   [Effective Dart: Usage](https://dart.dev/effective-dart/usage)
-   [Effective Dart: Design](https://dart.dev/effective-dart/design)
`
      },
      {
        sourcePath: "D:/conductor/src/internal/templates/data/skills/conductor-setup/assets/code_styleguides/general.md",
        category: "skills",
        subpath: "conductor-setup/assets/code_styleguides",
        ext: ".md",
        content: `# General Code Style Principles

This document outlines general coding principles that apply across all languages
and frameworks used in this project.

## Readability

-   Code should be easy to read and understand by humans.
-   Avoid overly clever or obscure constructs.

## Consistency

-   Follow existing patterns in the codebase.
-   Maintain consistent formatting, naming, and structure.

## Simplicity

-   Prefer simple solutions over complex ones.
-   Break down complex problems into smaller, manageable parts.

## Maintainability

-   Write code that is easy to modify and extend.
-   Minimize dependencies and coupling.

## Documentation

-   Document *why* something is done, not just *what*.
-   Keep documentation up-to-date with code changes.
`
      },
      {
        sourcePath: "D:/conductor/src/internal/templates/data/skills/conductor-setup/assets/code_styleguides/go.md",
        category: "skills",
        subpath: "conductor-setup/assets/code_styleguides",
        ext: ".md",
        content: `# Effective Go Style Guide Summary

This document summarizes key rules and best practices from the official
"Effective Go" guide for writing idiomatic Go code.

## 1. Formatting

-   **\`gofmt\`:** All Go code **must** be formatted with \`gofmt\` (or \`go fmt\`).
    This is a non-negotiable, automated standard.
-   **Indentation:** Use tabs for indentation (\`gofmt\` handles this).
-   **Line Length:** Go has no strict line length limit. Let \`gofmt\` handle line
    wrapping.

## 2. Naming

-   **\`MixedCaps\`:** Use \`MixedCaps\` or \`mixedCaps\` for multi-word names. Do not
    use underscores.
-   **Exported vs. Unexported:** Names starting with an uppercase letter are
    exported (public). Names starting with a lowercase letter are not exported
    (private).
-   **Package Names:** Short, concise, single-word, lowercase names.
-   **Getters:** Do not name getters with a \`Get\` prefix. A getter for a field
    named \`owner\` should be named \`Owner()\`.
-   **Interface Names:** One-method interfaces are named by the method name plus
    an \`-er\` suffix (e.g., \`Reader\`, \`Writer\`).

## 3. Control Structures

-   **\`if\`:** No parentheses around the condition. Braces are mandatory. Can
    include an initialization statement (e.g., \`if err := file.Chmod(0664); err
    != nil\`).
-   **\`for\`:** Go's only looping construct. Unifies \`for\` and \`while\`. Use
    \`for...range\` to iterate over slices, maps, strings, and channels.
-   **\`switch\`:** More general than in C. Cases do not fall through by default
    (use \`fallthrough\` explicitly). Can be used without an expression to
    function as a cleaner \`if-else-if\` chain.

## 4. Functions

-   **Multiple Returns:** Functions can return multiple values. This is the
    standard way to return a result and an error (e.g., \`value, err\`).
-   **Named Result Parameters:** Return parameters can be named. This can make
    code clearer and more concise.
-   **\`defer\`:** Schedules a function call to be run immediately before the
    function executing \`defer\` returns. Use it for cleanup tasks like closing
    files.

## 5. Data

-   **\`new\` vs. \`make\`:**
    -   \`new(T)\`: Allocates memory for a new item of type \`T\`, zeroes it, and
        returns a pointer (\`*T\`).
    -   \`make(T, ...)\`: Creates and initializes slices, maps, and channels only.
        Returns an initialized value of type \`T\` (not a pointer).
-   **Slices:** The preferred way to work with sequences. They are more flexible
    than arrays.
-   **Maps:** Use the "comma ok" idiom to check for the existence of a key:
    \`value, ok := myMap[key]\`.

## 6. Interfaces

-   **Implicit Implementation:** A type implements an interface by implementing
    its methods. No \`implements\` keyword is needed.
-   **Small Interfaces:** Prefer many small interfaces over one large one. The
    standard library is full of single-method interfaces (e.g., \`io.Reader\`).

## 7. Concurrency

-   **Share Memory By Communicating:** This is the core philosophy. Do not
    communicate by sharing memory; instead, share memory by communicating.
-   **Goroutines:** Lightweight, concurrently executing functions. Start one
    with the \`go\` keyword.
-   **Channels:** Typed conduits for communication between goroutines. Use
    \`make\` to create them.

## 8. Errors

-   **\`error\` type:** The built-in \`error\` interface is the standard way to
    handle errors.
-   **Explicit Error Handling:** Do not discard errors with the blank identifier
    (\`_\`). Check for errors explicitly.
-   **\`panic\`:** Reserved for truly exceptional, unrecoverable situations.
    Generally, libraries should not panic.

*Source: [Effective Go](https://go.dev/doc/effective_go)*
`
      },
      {
        sourcePath: "D:/conductor/src/internal/templates/data/skills/conductor-setup/assets/code_styleguides/html-css.md",
        category: "skills",
        subpath: "conductor-setup/assets/code_styleguides",
        ext: ".md",
        content: `# Google HTML/CSS Style Guide Summary

This document summarizes key rules and best practices from the Google HTML/CSS
Style Guide.

## 1. General Rules

-   **Protocol:** Use HTTPS for all embedded resources.
-   **Indentation:** Indent by 2 spaces. Do not use tabs.
-   **Capitalization:** Use only lowercase for all code (element names,
    attributes, selectors, properties).
-   **Trailing Whitespace:** Remove all trailing whitespace.
-   **Encoding:** Use UTF-8 (without a BOM). Specify \`<meta charset="utf-8">\` in
    HTML.

## 2. HTML Style Rules

-   **Document Type:** Use \`<!doctype html>\`.
-   **HTML Validity:** Use valid HTML.
-   **Semantics:** Use HTML elements according to their intended purpose (e.g.,
    use \`<p>\` for paragraphs, not for spacing).
-   **Multimedia Fallback:** Provide \`alt\` text for images and
    transcripts/captions for audio/video.
-   **Separation of Concerns:** Strictly separate structure (HTML), presentation
    (CSS), and behavior (JavaScript). Link to CSS and JS from external files.
-   **\`type\` Attributes:** Omit \`type\` attributes for stylesheets (\`<link>\`) and
    scripts (\`<script>\`).

## 3. HTML Formatting Rules

-   **General:** Use a new line for every block, list, or table element, and
    indent its children.
-   **Quotation Marks:** Use double quotation marks (\`""\`) for attribute values.

## 4. CSS Style Rules

-   **CSS Validity:** Use valid CSS.
-   **Class Naming:** Use meaningful, generic names. Separate words with a
    hyphen (\`-\`).
    -   **Good:** \`.video-player\`, \`.site-navigation\`
    -   **Bad:** \`.vid\`, \`.red-text\`
-   **ID Selectors:** Avoid using ID selectors for styling. Prefer class
    selectors.
-   **Shorthand Properties:** Use shorthand properties where possible (e.g.,
    \`padding\`, \`font\`).
-   **\`0\` and Units:** Omit units for \`0\` values (e.g., \`margin: 0;\`).
-   **Leading \`0\`s:** Always include leading \`0\`s for decimal values (e.g.,
    \`font-size: 0.8em;\`).
-   **Hexadecimal Notation:** Use 3-character hex notation where possible (e.g.,
    \`#fff\`).
-   **\`!important\`:** Avoid using \`!important\`.

## 5. CSS Formatting Rules

-   **Declaration Order:** Alphabetize declarations within a rule.
-   **Indentation:** Indent all block content.
-   **Semicolons:** Use a semicolon after every declaration.
-   **Spacing:**
    -   Use a space after a property name's colon (\`font-weight: bold;\`).
    -   Use a space between the last selector and the opening brace (\`.foo {\`).
    -   Start a new line for each selector and declaration.
-   **Rule Separation:** Separate rules with a new line.
-   **Quotation Marks:** Use single quotes (\`''\`) for attribute selectors and
    property values (e.g., \`[type='text']\`).

**BE CONSISTENT.** When editing code, match the existing style.

*Source:
[Google HTML/CSS Style Guide](https://google.github.io/styleguide/htmlcssguide.html)*
`
      },
      {
        sourcePath: "D:/conductor/src/internal/templates/data/skills/conductor-setup/assets/code_styleguides/javascript.md",
        category: "skills",
        subpath: "conductor-setup/assets/code_styleguides",
        ext: ".md",
        content: `# Google JavaScript Style Guide Summary

This document summarizes key rules and best practices from the Google JavaScript
Style Guide.

## 1. Source File Basics

-   **File Naming:** All lowercase, with underscores (\`_\`) or dashes (\`-\`).
    Extension must be \`.js\`.
-   **File Encoding:** UTF-8.
-   **Whitespace:** Use only ASCII horizontal spaces (0x20). Tabs are forbidden
    for indentation.

## 2. Source File Structure

-   New files should be ES modules (\`import\`/\`export\`).
-   **Exports:** Use named exports (\`export {MyClass};\`). **Do not use default
    exports.**
-   **Imports:** Do not use line-wrapped imports. The \`.js\` extension in import
    paths is mandatory.

## 3. Formatting

-   **Braces:** Required for all control structures (\`if\`, \`for\`, \`while\`,
    etc.), even single-line blocks. Use K&R style ("Egyptian brackets").
-   **Indentation:** +2 spaces for each new block.
-   **Semicolons:** Every statement must be terminated with a semicolon.
-   **Column Limit:** 80 characters.
-   **Line-wrapping:** Indent continuation lines at least +4 spaces.
-   **Whitespace:** Use single blank lines between methods. No trailing
    whitespace.

## 4. Language Features

-   **Variable Declarations:** Use \`const\` by default, \`let\` if reassignment is
    needed. **\`var\` is forbidden.**
-   **Array Literals:** Use trailing commas. Do not use the \`Array\` constructor.
-   **Object Literals:** Use trailing commas and shorthand properties. Do not
    use the \`Object\` constructor.
-   **Classes:** Do not use JavaScript getter/setter properties (\`get name()\`).
    Provide ordinary methods instead.
-   **Functions:** Prefer arrow functions for nested functions to preserve
    \`this\` context.
-   **String Literals:** Use single quotes (\`'\`). Use template literals (\`\` \`
    \`\`) for multi-line strings or complex interpolation.
-   **Control Structures:** Prefer \`for-of\` loops. \`for-in\` loops should only be
    used on dict-style objects.
-   **\`this\`:** Only use \`this\` in class constructors, methods, or in arrow
    functions defined within them.
-   **Equality Checks:** Always use identity operators (\`===\` / \`!==\`).

## 5. Disallowed Features

-   \`with\` keyword.
-   \`eval()\` or \`Function(...string)\`.
-   Automatic Semicolon Insertion.
-   Modifying builtin objects (\`Array.prototype.foo = ...\`).

## 6. Naming

-   **Classes:** \`UpperCamelCase\`.
-   **Methods & Functions:** \`lowerCamelCase\`.
-   **Constants:** \`CONSTANT_CASE\` (all uppercase with underscores).
-   **Non-constant Fields & Variables:** \`lowerCamelCase\`.

## 7. JSDoc

-   JSDoc is used on all classes, fields, and methods.
-   Use \`@param\`, \`@return\`, \`@override\`, \`@deprecated\`.
-   Type annotations are enclosed in braces (e.g., \`/** @param {string} userName
    */\`).

*Source:
[Google JavaScript Style Guide](https://google.github.io/styleguide/jsguide.html)*
`
      },
      {
        sourcePath: "D:/conductor/src/internal/templates/data/skills/conductor-setup/assets/code_styleguides/python.md",
        category: "skills",
        subpath: "conductor-setup/assets/code_styleguides",
        ext: ".md",
        content: `# Google Python Style Guide Summary

This document summarizes key rules and best practices from the Google Python
Style Guide.

## 1. Python Language Rules

-   **Linting:** Run \`pylint\` on your code to catch bugs and style issues.
-   **Imports:** Use \`import x\` for packages/modules. Use \`from x import y\` only
    when \`y\` is a submodule.
-   **Exceptions:** Use built-in exception classes. Do not use bare \`except:\`
    clauses.
-   **Global State:** Avoid mutable global state. Module-level constants are
    okay and should be \`ALL_CAPS_WITH_UNDERSCORES\`.
-   **Comprehensions:** Use for simple cases. Avoid for complex logic where a
    full loop is more readable.
-   **Default Argument Values:** Do not use mutable objects (like \`[]\` or \`{}\`)
    as default values.
-   **True/False Evaluations:** Use implicit false (e.g., \`if not my_list:\`).
    Use \`if foo is None:\` to check for \`None\`.
-   **Type Annotations:** Strongly encouraged for all public APIs.

## 2. Python Style Rules

-   **Line Length:** Maximum 80 characters.
-   **Indentation:** 4 spaces per indentation level. Never use tabs.
-   **Blank Lines:** Two blank lines between top-level definitions (classes,
    functions). One blank line between method definitions.
-   **Whitespace:** Avoid extraneous whitespace. Surround binary operators with
    single spaces.
-   **Docstrings:** Use \`"""triple double quotes"""\`. Every public module,
    function, class, and method must have a docstring.
    -   **Format:** Start with a one-line summary. Include \`Args:\`, \`Returns:\`,
        and \`Raises:\` sections.
-   **Strings:** Use f-strings for formatting. Be consistent with single (\`'\`)
    or double (\`"\`) quotes.
-   **\`TODO\` Comments:** Use \`TODO(username): Fix this.\` format.
-   **Imports Formatting:** Imports should be on separate lines and grouped:
    standard library, third-party, and your own application's imports.

## 3. Naming

-   **General:** \`snake_case\` for modules, functions, methods, and variables.
-   **Classes:** \`PascalCase\`.
-   **Constants:** \`ALL_CAPS_WITH_UNDERSCORES\`.
-   **Internal Use:** Use a single leading underscore (\`_internal_variable\`) for
    internal module/class members.

## 4. Main

-   All executable files should have a \`main()\` function that contains the main
    logic, called from a \`if __name__ == '__main__':\` block.

**BE CONSISTENT.** When editing code, match the existing style.

*Source:
[Google Python Style Guide](https://google.github.io/styleguide/pyguide.html)*
`
      },
      {
        sourcePath: "D:/conductor/src/internal/templates/data/skills/conductor-setup/assets/code_styleguides/typescript.md",
        category: "skills",
        subpath: "conductor-setup/assets/code_styleguides",
        ext: ".md",
        content: `# Google TypeScript Style Guide Summary

This document summarizes key rules and best practices from the Google TypeScript
Style Guide, which is enforced by the \`gts\` tool.

## 1. Language Features

-   **Variable Declarations:** Always use \`const\` or \`let\`. **\`var\` is
    forbidden.** Use \`const\` by default.
-   **Modules:** Use ES6 modules (\`import\`/\`export\`). **Do not use
    \`namespace\`.**
-   **Exports:** Use named exports (\`export {MyClass};\`). **Do not use default
    exports.**
-   **Classes:**
    -   **Do not use \`#private\` fields.** Use TypeScript's \`private\` visibility
        modifier.
    -   Mark properties never reassigned outside the constructor with
        \`readonly\`.
    -   **Never use the \`public\` modifier** (it's the default). Restrict
        visibility with \`private\` or \`protected\` where possible.
-   **Functions:** Prefer function declarations for named functions. Use arrow
    functions for anonymous functions/callbacks.
-   **String Literals:** Use single quotes (\`'\`). Use template literals (\`\` \`
    \`\`) for interpolation and multi-line strings.
-   **Equality Checks:** Always use triple equals (\`===\`) and not equals
    (\`!==\`).
-   **Type Assertions:** **Avoid type assertions (\`x as SomeType\`) and
    non-nullability assertions (\`y!\`)**. If you must use them, provide a clear
    justification.

## 2. Disallowed Features

-   **\`any\` Type:** **Avoid \`any\`**. Prefer \`unknown\` or a more specific type.
-   **Wrapper Objects:** Do not instantiate \`String\`, \`Boolean\`, or \`Number\`
    wrapper classes.
-   **Automatic Semicolon Insertion (ASI):** Do not rely on it. **Explicitly end
    all statements with a semicolon.**
-   **\`const enum\`:** Do not use \`const enum\`. Use plain \`enum\` instead.
-   **\`eval()\` and \`Function(...string)\`:** Forbidden.

## 3. Naming

-   **\`UpperCamelCase\`:** For classes, interfaces, types, enums, and decorators.
-   **\`lowerCamelCase\`:** For variables, parameters, functions, methods, and
    properties.
-   **\`CONSTANT_CASE\`:** For global constant values, including enum values.
-   **\`_\` Prefix/Suffix:** **Do not use \`_\` as a prefix or suffix** for
    identifiers, including for private properties.

## 4. Type System

-   **Type Inference:** Rely on type inference for simple, obvious types. Be
    explicit for complex types.
-   **\`undefined\` and \`null\`:** Both are supported. Be consistent within your
    project.
-   **Optional vs. \`|undefined\`:** Prefer optional parameters and fields (\`?\`)
    over adding \`|undefined\` to the type.
-   **\`Array<T>\` Type:** Use \`T[]\` for simple types. Use \`Array<T>\` for more
    complex union types (e.g., \`Array<string | number>\`).
-   **\`{}\` Type:** **Do not use \`{}\`**. Prefer \`unknown\`, \`Record<string,
    unknown>\`, or \`object\`.

## 5. Comments and Documentation

-   **JSDoc:** Use \`/** JSDoc */\` for documentation, \`//\` for implementation
    comments.
-   **Redundancy:** **Do not declare types in \`@param\` or \`@return\` blocks**
    (e.g., \`/** @param {string} user */\`). This is redundant in TypeScript.
-   **Add Information:** Comments must add information, not just restate the
    code.

*Source:
[Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html)*
`
      },
      {
        sourcePath: "D:/conductor/src/internal/templates/data/skills/conductor-setup/assets/workflow.md",
        category: "skills",
        subpath: "conductor-setup/assets",
        ext: ".md",
        content: `# Project Workflow

## Guiding Principles

1.  **The Plan is the Source of Truth:** All work must be tracked in \`plan.md\`
2.  **The Tech Stack is Deliberate:** Changes to the tech stack must be
    documented in \`tech-stack.md\` *before* implementation
3.  **Test-Driven Development:** Write unit tests before implementing
    functionality
4.  **High Code Coverage:** Aim for >80% code coverage for all modules
5.  **User Experience First:** Every decision should prioritize user experience
6.  **Non-Interactive & CI-Aware:** Prefer non-interactive commands. Use
    \`CI=true\` for watch-mode tools (tests, linters) to ensure single execution.

## Task Workflow

All tasks follow a strict lifecycle:

### Standard Task Workflow

1.  **Select Task:** Choose the next available task from \`plan.md\` in sequential
    order

2.  **Mark In Progress:** Before beginning work, edit \`plan.md\` and change the
    task from \`[ ]\` to \`[~]\`

3.  **Write Failing Tests (Red Phase):**

    -   Create a new test file for the feature or bug fix.
    -   Write one or more unit tests that clearly define the expected behavior
        and acceptance criteria for the task.
    -   **CRITICAL:** Run the tests and confirm that they fail as expected. This
        is the "Red" phase of TDD. Do not proceed until you have failing tests.

4.  **Implement to Pass Tests (Green Phase):**

    -   Write the minimum amount of application code necessary to make the
        failing tests pass.
    -   Run the test suite again and confirm that all tests now pass. This is
        the "Green" phase.

5.  **Refactor (Optional but Recommended):**

    -   With the safety of passing tests, refactor the implementation code and
        the test code to improve clarity, remove duplication, and enhance
        performance without changing the external behavior.
    -   Rerun tests to ensure they still pass after refactoring.

6.  **Verify Coverage:** Run coverage reports using the project's chosen tools.
    For example, in a Python project, this might look like: \`bash pytest
    --cov=app --cov-report=html\` Target: >80% coverage for new code. The
    specific tools and commands will vary by language and framework.

7.  **Document Deviations:** If implementation differs from tech stack:

    -   **STOP** implementation
    -   Update \`tech-stack.md\` with new design
    -   Add dated note explaining the change
    -   Resume implementation

8.  **Commit Code Changes:**

    -   Stage all code changes related to the task.
    -   Propose a clear, concise commit message e.g, \`feat(ui): Create basic
        HTML structure for calculator\`.
    -   Perform the commit.

9.  **Attach Task Summary with Git Notes:**

    -   **Step 9.1: Get Commit Hash:** Obtain the hash of the *just-completed
        commit* (\`git log -1 --format="%H"\`).
    -   **Step 9.2: Draft Note Content:** Create a detailed summary for the
        completed task. This should include the task name, a summary of changes,
        a list of all created/modified files, and the core "why" for the change.
    -   **Step 9.3: Attach Note:** Use the \`git notes\` command to attach the
        summary to the commit. \`bash # The note content from the previous step
        is passed via the -m flag. git notes add -m "<note content>"
        <commit_hash>\`

10. **Get and Record Task Commit SHA:**

    -   **Step 10.1: Update Plan:** Read \`plan.md\`, find the line for the
        completed task, update its status from \`[~]\` to \`[x]\`, and append the
        first 7 characters of the *just-completed commit's* commit hash.
    -   **Step 10.2: Write Plan:** Write the updated content back to \`plan.md\`.

11. **Commit Plan Update:**

    -   **Action:** Stage the modified \`plan.md\` file.
    -   **Action:** Commit this change with a descriptive message (e.g.,
        \`conductor(plan): Mark task 'Create user model' as complete\`).

### Task Correction & Plan Amendment Workflows

When an implemented task or phase requires corrections, amendments, or additions, follow these standard workflows to maintain plan integrity and avoid untracked code drift:

1.  **In-Flight Refinements:** If minor gaps are found while a task is actively
    in-progress (\`[~]\`), make the adjustments directly in the active
    implementation stream and ensure passing tests before committing.
2.  **Code Review Corrections (\`conductor-review\`):** If issues are identified
    during or after a code review, instruct the agent to review your changes
    (e.g., *"run a review"* or triggering the action manually in compatible
    clients). The review agent will automatically append a \`Review Fixes\` phase
    to \`plan.md\` so that correction tasks are formally tracked and
    checkpointed.
3.  **Logical State Reversions (\`conductor-revert\`):** If a task implementation
    is fundamentally flawed or needs to be redone, instruct the agent to revert
    the changes (e.g., *"revert the last task"* or triggering the action
    manually in compatible clients). This safely rolls back associated git
    commits and resets the task state in \`plan.md\` back to pending \`[ ]\` to
    allow a clean restart.

### Phase Completion Verification and Checkpointing Protocol

**Trigger:** This protocol is executed immediately after a task is completed
that also concludes a phase in \`plan.md\`.

1.  **Announce Protocol Start:** Inform the user that the phase is complete and
    the verification and checkpointing protocol has begun.

2.  **Ensure Test Coverage for Phase Changes:**

    -   **Step 2.1: Determine Phase Scope:** To identify the files changed in
        this phase, you must first find the starting point. Read \`plan.md\` to
        find the Git commit SHA of the *previous* phase's checkpoint. If no
        previous checkpoint exists, the scope is all changes since the first
        commit.
    -   **Step 2.2: List Changed Files:** Execute \`git diff --name-only
        <previous_checkpoint_sha> HEAD\` to get a precise list of all files
        modified during this phase.
    -   **Step 2.3: Verify and Create Tests:** For each file in the list:
        -   **CRITICAL:** First, check its extension. Exclude non-code files
            (e.g., \`.json\`, \`.md\`, \`.yaml\`).
        -   For each remaining code file, verify a corresponding test file
            exists.
        -   If a test file is missing, you **must** create one. Before writing
            the test, **first, analyze other test files in the repository to
            determine the correct naming convention and testing style.** The new
            tests **must** validate the functionality described in this phase's
            tasks (\`plan.md\`).

3.  **Execute Automated Tests with Proactive Debugging:**

    -   Before execution, you **must** announce the exact shell command you will
        use to run the tests.
    -   **Example Announcement:** "I will now run the automated test suite to
        verify the phase. **Command:** \`CI=true npm test\`"
    -   Execute the announced command.
    -   If tests fail, you **must** inform the user and begin debugging. You may
        attempt to propose a fix a **maximum of two times**. If the tests still
        fail after your second proposed fix, you **must stop**, report the
        persistent failure, and ask the user for guidance.

4.  **Propose a Detailed, Actionable Manual Verification Plan:**

    -   **CRITICAL:** To generate the plan, first analyze \`product.md\`,
        \`product-guidelines.md\`, and \`plan.md\` to determine the user-facing
        goals of the completed phase.
    -   You **must** generate a step-by-step plan that walks the user through
        the verification process, including any necessary commands and specific,
        expected outcomes.
    -   The plan you present to the user **must** follow this format:

        **For a Frontend Change:** \`\`\` The automated tests have passed. For
        manual verification, please follow these steps:

        **Manual Verification Steps:** 1. **Start the development server with
        the command:** \`npm run dev\` 2. **Open your browser to:**
        \`http://localhost:3000\` 3. **Confirm that you see:** The new user
        profile page, with the user's name and email displayed correctly. \`\`\`

        **For a Backend Change:** \`\`\` The automated tests have passed. For
        manual verification, please follow these steps:

        **Manual Verification Steps:** 1. **Ensure the server is running.** 2.
        **Execute the following command in your terminal:** \`curl -X POST
        http://localhost:8080/api/v1/users -d '{"name": "test"}'\` 3. **Confirm
        that you receive:** A JSON response with a status of \`201 Created\`. \`\`\`

5.  **Await Explicit User Feedback:**

    -   After presenting the detailed plan, ask the user for confirmation:
        "**Does this meet your expectations? Please confirm with yes or provide
        feedback on what needs to be changed.**"
    -   **PAUSE** and await the user's response. Do not proceed without an
        explicit yes or confirmation.

6.  **Identify Target Commit for Report:**

    -   Do NOT create a new empty commit for checkpointing.
    -   Identify the hash of the last functional commit made during this phase. This will be the target for the verification report.

7.  **Attach Auditable Verification Report using Git Notes:**

    -   **Step 7.1: Draft Note Content:** Create a detailed verification report
        including the automated test command, the manual verification steps, and
        the user's confirmation.
    -   **Step 7.2: Attach Note:** Use the \`git notes\` command to attach the full report to the target commit identified in step 6.

8.  **Get and Record Phase Checkpoint SHA:**

    -   **Step 8.1: Get Commit Hash:** Obtain the hash of the *just-created
        checkpoint commit* (\`git log -1 --format="%H"\`).
    -   **Step 8.2: Update Plan:** Read \`plan.md\`, find the heading for the
        completed phase, and append the first 7 characters of the commit hash in
        the format \`[checkpoint: <sha>]\`.
    -   **Step 8.3: Write Plan:** Write the updated content back to \`plan.md\`.

9.  **Commit Plan Update:**

    -   **Action:** Stage the modified \`plan.md\` file.
    -   **Action:** Commit this change with a descriptive message following the
        format \`conductor(plan): Mark phase '<PHASE NAME>' as complete\`.

10. **Announce Completion:** Inform the user that the phase is complete and the
    checkpoint has been created, with the detailed verification report attached
    as a git note.

### Quality Gates

Before marking any task complete, verify:

-   [ ] All tests pass
-   [ ] Code coverage meets requirements (>80%)
-   [ ] Code follows project's code style guidelines (as defined in
    \`code_styleguides/\`)
-   [ ] All public functions/methods are documented (e.g., docstrings, JSDoc,
    GoDoc)
-   [ ] Type safety is enforced (e.g., type hints, TypeScript types, Go types)
-   [ ] No linting or static analysis errors (using the project's configured
    tools)
-   [ ] Works correctly on mobile (if applicable)
-   [ ] Documentation updated if needed
-   [ ] No security vulnerabilities introduced

## Development Commands

**AI AGENT INSTRUCTION: This section should be adapted to the project's specific
language, framework, and build tools.**

### Setup

\`\`\`bash
# Example: Commands to set up the development environment (e.g., install dependencies, configure database)
# e.g., for a Node.js project: npm install
# e.g., for a Go project: go mod tidy
\`\`\`

### Daily Development

\`\`\`bash
# Example: Commands for common daily tasks (e.g., start dev server, run tests, lint, format)
# e.g., for a Node.js project: npm run dev, npm test, npm run lint
# e.g., for a Go project: go run main.go, go test ./..., go fmt ./...
\`\`\`

### Before Committing

\`\`\`bash
# Example: Commands to run all pre-commit checks (e.g., format, lint, type check, run tests)
# e.g., for a Node.js project: npm run check
# e.g., for a Go project: make check (if a Makefile exists)
\`\`\`

## Testing Requirements

### Unit Testing

-   Every module must have corresponding tests.
-   Use appropriate test setup/teardown mechanisms (e.g., fixtures,
    beforeEach/afterEach).
-   Mock external dependencies.
-   Test both success and failure cases.

### Integration Testing

-   Test complete user flows
-   Verify database transactions
-   Test authentication and authorization
-   Check form submissions

### Mobile Testing

-   Test on actual iPhone when possible
-   Use Safari developer tools
-   Test touch interactions
-   Verify responsive layouts
-   Check performance on 3G/4G

## Code Review Process

### Self-Review Checklist

Before requesting review:

1.  **Functionality**

    -   Feature works as specified
    -   Edge cases handled
    -   Error messages are user-friendly

2.  **Code Quality**

    -   Follows style guide
    -   DRY principle applied
    -   Clear variable/function names
    -   Appropriate comments

3.  **Testing**

    -   Unit tests comprehensive
    -   Integration tests pass
    -   Coverage adequate (>80%)

4.  **Security**

    -   No hardcoded secrets
    -   Input validation present
    -   SQL injection prevented
    -   XSS protection in place

5.  **Performance**

    -   Database queries optimized
    -   Images optimized
    -   Caching implemented where needed

6.  **Mobile Experience**

    -   Touch targets adequate (44x44px)
    -   Text readable without zooming
    -   Performance acceptable on mobile
    -   Interactions feel native

## Commit Guidelines

### Message Format

\`\`\`
<type>(<scope>): <description>

[optional body]

[optional footer]
\`\`\`

### Types

-   \`feat\`: New feature
-   \`fix\`: Bug fix
-   \`docs\`: Documentation only
-   \`style\`: Formatting, missing semicolons, etc.
-   \`refactor\`: Code change that neither fixes a bug nor adds a feature
-   \`test\`: Adding missing tests
-   \`chore\`: Maintenance tasks

### Examples

\`\`\`bash
git commit -m "feat(auth): Add remember me functionality"
git commit -m "fix(posts): Correct excerpt generation for short posts"
git commit -m "test(comments): Add tests for emoji reaction limits"
git commit -m "style(mobile): Improve button touch targets"
\`\`\`

## Definition of Done

A task is complete when:

1.  All code implemented to specification
2.  Unit tests written and passing
3.  Code coverage meets project requirements
4.  Documentation complete (if applicable)
5.  Code passes all configured linting and static analysis checks
6.  Works beautifully on mobile (if applicable)
7.  Implementation notes added to \`plan.md\`
8.  Changes committed with proper message
9.  Git note with task summary attached to the commit

## Emergency Procedures

### Critical Bug in Production

1.  Create hotfix branch from main
2.  Write failing test for bug
3.  Implement minimal fix
4.  Test thoroughly including mobile
5.  Deploy immediately
6.  Document in plan.md

### Data Loss

1.  Stop all write operations
2.  Restore from latest backup
3.  Verify data integrity
4.  Document incident
5.  Update backup procedures

### Security Breach

1.  Rotate all secrets immediately
2.  Review access logs
3.  Patch vulnerability
4.  Notify affected users (if any)
5.  Document and update security procedures

## Deployment Workflow

### Pre-Deployment Checklist

-   [ ] All tests passing
-   [ ] Coverage >80%
-   [ ] No linting errors
-   [ ] Mobile testing complete
-   [ ] Environment variables configured
-   [ ] Database migrations ready
-   [ ] Backup created

### Deployment Steps

1.  Merge feature branch to main
2.  Tag release with version
3.  Push to deployment service
4.  Run database migrations
5.  Verify deployment
6.  Test critical paths
7.  Monitor for errors

### Post-Deployment

1.  Monitor analytics
2.  Check error logs
3.  Gather user feedback
4.  Plan next iteration

## Continuous Improvement

-   Review workflow weekly
-   Update based on pain points
-   Document lessons learned
-   Optimize for user happiness
-   Keep things simple and maintainable
`
      },
      {
        sourcePath: "D:/conductor/src/internal/templates/data/skills/conductor-setup/scripts/resume.py",
        category: "skills",
        subpath: "conductor-setup/scripts",
        ext: ".py",
        content: `"""Determines the next unblocked setup step in the Conductor workflow."""

import json
import os
import sys


def determine_resumption():
  """Checks existing setup artifacts and returns the next unblocked step."""
  conductor_dir = "conductor"
  files = [
      "product.md",
      "product-guidelines.md",
      "tech-stack.md",
      "code_styleguides",
      "workflow.md",
  ]

  checklist = {}
  for filename in files:
    path = os.path.join(conductor_dir, filename)
    checklist[filename] = os.path.exists(path)

  setup_complete = os.path.exists(os.path.join(conductor_dir, "index.md"))

  next_step = None

  chain = [
      ("product.md", "Product Definition"),
      ("product-guidelines.md", "Product Guidelines"),
      ("tech-stack.md", "Technology Stack"),
      ("code_styleguides", "Code Style Guides"),
      ("workflow.md", "Workflow Configuration"),
  ]

  for filename, step_name in chain:
    if not checklist[filename]:
      next_step = {
          "step": step_name,
          "file": filename,
      }
      break

  return {
      "setup_complete": setup_complete,
      "checklist": checklist,
      "next_step": next_step,
  }


if __name__ == "__main__":
  result = determine_resumption()
  print(json.dumps(result, indent=2))
  sys.exit(0)
`
      },
      {
        sourcePath: "D:/conductor/src/internal/templates/data/skills/conductor-status/SKILL.md",
        category: "skills",
        subpath: "conductor-status",
        ext: ".md",
        content: `---
name: conductor-status
description: Displays the current progress of the project by parsing the Tracks Registry and individual track plans.
metadata:
  version: "1.0"
---

# Conductor Status Skill

You are an AI agent. Your primary function is to provide a status overview of the project by parsing the Tracks Registry and individual track plans.

## Operational Standards

-   **Precise Execution:** Do not skip steps. Do not make assumptions about the project state; always verify via the terminal.
-   **Tool Validation:** You MUST validate the success of every tool call. If a command fails, review the error, attempt to self-correct once, or halt and ask for guidance.
-   **Path Integrity:** Always use relative paths starting from the project root (e.g., \`conductor/tracks.md\`).
-   **Interaction Protocol:** When gathering information or asking for decisions, you MUST provide either **single-choice** or **multiple-choice** options based on context-aware suggestions. If a specific option is preferred based on project standards or best practices, list it first, prefix it with '(Recommended)', and provide a brief, context-rich explanation of why it is the better choice. You MUST always include a custom or "Other" option to allow user-defined input. Avoid asking raw, open-ended questions without suggestions.
-   **Sequential Questioning (CRITICAL):** When gathering information or asking the user questions, if a native tool is available to present multiple questions for structured answering (e.g., a modal or form tool), you may use it to group questions. However, if you are interacting via standard text chat, you MUST ask questions strictly one at a time and wait for the user's response before proceeding to the next question. Do NOT output multiple questions in a single chat response.

---

## 1. Handshake & Context Initialization

Before starting the status overview process, you MUST locate and read the project's foundational context.

1.  **Locate Index:** Check for the existence of \`conductor/index.md\` in the project root.
    -   **If Missing:**
        -   Announce: *"Conductor is not initialized properly. I cannot find the \`conductor/index.md\` file."*
        -   Ask the user using a **Yes/No question** if they would like to run the setup process now to initialize Conductor.
        -   **If Approved:** Internally invoke the \`conductor-setup\` skill.
        -   **If Denied:** HALT and await further instructions.

2.  **Load & Verify Context:** Read \`conductor/index.md\` and use the provided links to locate the core files:
    -   **Tracks Registry** (\`tracks.md\`)
    -   **Product Definition** (\`product.md\`)
    -   **Tech Stack** (\`tech-stack.md\`)
    -   **Workflow** (\`workflow.md\`)
    -   **Health Check:** You MUST verify that every linked file actually exists. If ANY of these core files are missing, HALT immediately. Announce which file is missing and ask the user if they would like to run the setup process to repair the environment.

---

## 2. Status Overview Protocol

Follow this sequence to provide a status overview.

### 2.1 Read Project Plan
1.  **Locate and Read:** Read the content of the **Tracks Registry**. Check \`conductor/index.md\` for the link, otherwise use the Default Path: \`conductor/tracks.md\`.
2.  **Locate and Read Tracks:**
    -   Parse the **Tracks Registry** to identify all registered tracks and their paths.
        *   **Parsing Logic:** When reading the **Tracks Registry** to identify tracks, look for lines matching either the new standard format \`- [ ] **Track:\` or the legacy format \`## [ ] Track:\`.
    -   For each track, resolve and read its **Implementation Plan**. Check the track's \`index.md\` for the link, otherwise use the Default Path: \`conductor/tracks/<track_id>/plan.md\`.

### 2.2 Parse and Summarize Plan
1.  **Parse Content:**
    -   Identify major project phases/sections (e.g., top-level markdown headings).
    -   Identify individual tasks and their current status by looking for checkbox markers: \`[x]\` for completed, \`[~]\` for in-progress, and \`[ ]\` for pending.
2.  **Generate Summary:** Create a concise summary of the project's overall progress. This should include:
    -   The total number of major phases.
    -   The total number of tasks.
    -   The number of tasks completed, in progress, and pending.

### 2.3 Present Status Overview
1.  **Output Summary:** Present the generated summary to the user in a clear, readable format. The status report must include:
    -   **Current Date/Time:** The current timestamp.
    -   **Project Status:** A high-level summary of progress (e.g., "On Track", "Behind Schedule", "Blocked").
    -   **Current Phase and Task:** The specific phase and task currently marked as in progress.
    -   **Next Action Needed:** The next task listed as pending.
    -   **Blockers:** Any items explicitly marked as blockers in the plan.
    -   **Phases (total):** The total number of major phases.
    -   **Tasks (total):** The total number of tasks.
    -   **Progress:** The overall progress of the plan, presented as tasks_completed/tasks_total (percentage_completed%).
`
      }
    ];
  }
});

// src/internal/templates/manager.ts
function toMeta(t) {
  const meta = parseFrontmatter(t.content);
  meta.sourceDir = t.category;
  meta.subpath = t.subpath;
  meta.ext = t.ext;
  if (!meta.id) {
    const fileName = t.sourcePath.split(/[\\/]/).pop() || "";
    meta.id = (0, import_node_path2.parse)(fileName).name;
    meta.name = meta.name || meta.id;
  }
  return meta;
}
var import_node_fs2, import_node_path2, EmbeddedTemplateManager;
var init_manager = __esm({
  "src/internal/templates/manager.ts"() {
    "use strict";
    import_node_fs2 = require("node:fs");
    import_node_path2 = require("node:path");
    init_types2();
    init_errors();
    init_embedded();
    EmbeddedTemplateManager = class {
      listAvailable(_tool) {
        return this.listAll();
      }
      /** Lista todos os templates a partir dos dados embutidos no bundle. */
      listAll() {
        return TEMPLATES.map((t) => toMeta(t));
      }
      getByName(name) {
        return this.listAll().find((t) => t.name === name || t.id === name);
      }
      generate(req) {
        const dir = (0, import_node_path2.parse)(req.targetPath).dir;
        (0, import_node_fs2.mkdirSync)(dir, { recursive: true });
        if ((0, import_node_fs2.existsSync)(req.targetPath) && !req.force) {
          return {
            success: false,
            filePath: req.targetPath,
            message: "File already exists (use --force to overwrite)",
            error: new FileExistsError()
          };
        }
        const tmpl = this.getByName(req.templateName);
        if (!tmpl) {
          return {
            success: false,
            message: `Template not found: ${req.templateName}`
          };
        }
        (0, import_node_fs2.writeFileSync)(req.targetPath, tmpl.content, "utf-8");
        return {
          success: true,
          filePath: req.targetPath,
          message: "Template generated successfully"
        };
      }
    };
  }
});

// node_modules/chalk/source/vendor/ansi-styles/index.js
function assembleStyles() {
  const codes = /* @__PURE__ */ new Map();
  for (const [groupName, group] of Object.entries(styles)) {
    for (const [styleName, style] of Object.entries(group)) {
      styles[styleName] = {
        open: `\x1B[${style[0]}m`,
        close: `\x1B[${style[1]}m`
      };
      group[styleName] = styles[styleName];
      codes.set(style[0], style[1]);
    }
    Object.defineProperty(styles, groupName, {
      value: group,
      enumerable: false
    });
  }
  Object.defineProperty(styles, "codes", {
    value: codes,
    enumerable: false
  });
  styles.color.close = "\x1B[39m";
  styles.bgColor.close = "\x1B[49m";
  styles.color.ansi = wrapAnsi16();
  styles.color.ansi256 = wrapAnsi256();
  styles.color.ansi16m = wrapAnsi16m();
  styles.bgColor.ansi = wrapAnsi16(ANSI_BACKGROUND_OFFSET);
  styles.bgColor.ansi256 = wrapAnsi256(ANSI_BACKGROUND_OFFSET);
  styles.bgColor.ansi16m = wrapAnsi16m(ANSI_BACKGROUND_OFFSET);
  Object.defineProperties(styles, {
    rgbToAnsi256: {
      value(red, green, blue) {
        if (red === green && green === blue) {
          if (red < 8) {
            return 16;
          }
          if (red > 248) {
            return 231;
          }
          return Math.round((red - 8) / 247 * 24) + 232;
        }
        return 16 + 36 * Math.round(red / 255 * 5) + 6 * Math.round(green / 255 * 5) + Math.round(blue / 255 * 5);
      },
      enumerable: false
    },
    hexToRgb: {
      value(hex) {
        const matches = /[a-f\d]{6}|[a-f\d]{3}/i.exec(hex.toString(16));
        if (!matches) {
          return [0, 0, 0];
        }
        let [colorString] = matches;
        if (colorString.length === 3) {
          colorString = [...colorString].map((character) => character + character).join("");
        }
        const integer = Number.parseInt(colorString, 16);
        return [
          /* eslint-disable no-bitwise */
          integer >> 16 & 255,
          integer >> 8 & 255,
          integer & 255
          /* eslint-enable no-bitwise */
        ];
      },
      enumerable: false
    },
    hexToAnsi256: {
      value: (hex) => styles.rgbToAnsi256(...styles.hexToRgb(hex)),
      enumerable: false
    },
    ansi256ToAnsi: {
      value(code) {
        if (code < 8) {
          return 30 + code;
        }
        if (code < 16) {
          return 90 + (code - 8);
        }
        let red;
        let green;
        let blue;
        if (code >= 232) {
          red = ((code - 232) * 10 + 8) / 255;
          green = red;
          blue = red;
        } else {
          code -= 16;
          const remainder = code % 36;
          red = Math.floor(code / 36) / 5;
          green = Math.floor(remainder / 6) / 5;
          blue = remainder % 6 / 5;
        }
        const value = Math.max(red, green, blue) * 2;
        if (value === 0) {
          return 30;
        }
        let result = 30 + (Math.round(blue) << 2 | Math.round(green) << 1 | Math.round(red));
        if (value === 2) {
          result += 60;
        }
        return result;
      },
      enumerable: false
    },
    rgbToAnsi: {
      value: (red, green, blue) => styles.ansi256ToAnsi(styles.rgbToAnsi256(red, green, blue)),
      enumerable: false
    },
    hexToAnsi: {
      value: (hex) => styles.ansi256ToAnsi(styles.hexToAnsi256(hex)),
      enumerable: false
    }
  });
  return styles;
}
var ANSI_BACKGROUND_OFFSET, wrapAnsi16, wrapAnsi256, wrapAnsi16m, styles, modifierNames, foregroundColorNames, backgroundColorNames, colorNames, ansiStyles, ansi_styles_default;
var init_ansi_styles = __esm({
  "node_modules/chalk/source/vendor/ansi-styles/index.js"() {
    ANSI_BACKGROUND_OFFSET = 10;
    wrapAnsi16 = (offset = 0) => (code) => `\x1B[${code + offset}m`;
    wrapAnsi256 = (offset = 0) => (code) => `\x1B[${38 + offset};5;${code}m`;
    wrapAnsi16m = (offset = 0) => (red, green, blue) => `\x1B[${38 + offset};2;${red};${green};${blue}m`;
    styles = {
      modifier: {
        reset: [0, 0],
        // 21 isn't widely supported and 22 does the same thing
        bold: [1, 22],
        dim: [2, 22],
        italic: [3, 23],
        underline: [4, 24],
        overline: [53, 55],
        inverse: [7, 27],
        hidden: [8, 28],
        strikethrough: [9, 29]
      },
      color: {
        black: [30, 39],
        red: [31, 39],
        green: [32, 39],
        yellow: [33, 39],
        blue: [34, 39],
        magenta: [35, 39],
        cyan: [36, 39],
        white: [37, 39],
        // Bright color
        blackBright: [90, 39],
        gray: [90, 39],
        // Alias of `blackBright`
        grey: [90, 39],
        // Alias of `blackBright`
        redBright: [91, 39],
        greenBright: [92, 39],
        yellowBright: [93, 39],
        blueBright: [94, 39],
        magentaBright: [95, 39],
        cyanBright: [96, 39],
        whiteBright: [97, 39]
      },
      bgColor: {
        bgBlack: [40, 49],
        bgRed: [41, 49],
        bgGreen: [42, 49],
        bgYellow: [43, 49],
        bgBlue: [44, 49],
        bgMagenta: [45, 49],
        bgCyan: [46, 49],
        bgWhite: [47, 49],
        // Bright color
        bgBlackBright: [100, 49],
        bgGray: [100, 49],
        // Alias of `bgBlackBright`
        bgGrey: [100, 49],
        // Alias of `bgBlackBright`
        bgRedBright: [101, 49],
        bgGreenBright: [102, 49],
        bgYellowBright: [103, 49],
        bgBlueBright: [104, 49],
        bgMagentaBright: [105, 49],
        bgCyanBright: [106, 49],
        bgWhiteBright: [107, 49]
      }
    };
    modifierNames = Object.keys(styles.modifier);
    foregroundColorNames = Object.keys(styles.color);
    backgroundColorNames = Object.keys(styles.bgColor);
    colorNames = [...foregroundColorNames, ...backgroundColorNames];
    ansiStyles = assembleStyles();
    ansi_styles_default = ansiStyles;
  }
});

// node_modules/chalk/source/vendor/supports-color/index.js
function hasFlag(flag, argv = globalThis.Deno ? globalThis.Deno.args : import_node_process2.default.argv) {
  const prefix = flag.startsWith("-") ? "" : flag.length === 1 ? "-" : "--";
  const position = argv.indexOf(prefix + flag);
  const terminatorPosition = argv.indexOf("--");
  return position !== -1 && (terminatorPosition === -1 || position < terminatorPosition);
}
function envForceColor() {
  if ("FORCE_COLOR" in env) {
    if (env.FORCE_COLOR === "true") {
      return 1;
    }
    if (env.FORCE_COLOR === "false") {
      return 0;
    }
    return env.FORCE_COLOR.length === 0 ? 1 : Math.min(Number.parseInt(env.FORCE_COLOR, 10), 3);
  }
}
function translateLevel(level) {
  if (level === 0) {
    return false;
  }
  return {
    level,
    hasBasic: true,
    has256: level >= 2,
    has16m: level >= 3
  };
}
function _supportsColor(haveStream, { streamIsTTY, sniffFlags = true } = {}) {
  const noFlagForceColor = envForceColor();
  if (noFlagForceColor !== void 0) {
    flagForceColor = noFlagForceColor;
  }
  const forceColor = sniffFlags ? flagForceColor : noFlagForceColor;
  if (forceColor === 0) {
    return 0;
  }
  if (sniffFlags) {
    if (hasFlag("color=16m") || hasFlag("color=full") || hasFlag("color=truecolor")) {
      return 3;
    }
    if (hasFlag("color=256")) {
      return 2;
    }
  }
  if ("TF_BUILD" in env && "AGENT_NAME" in env) {
    return 1;
  }
  if (haveStream && !streamIsTTY && forceColor === void 0) {
    return 0;
  }
  const min = forceColor || 0;
  if (env.TERM === "dumb") {
    return min;
  }
  if (import_node_process2.default.platform === "win32") {
    const osRelease = import_node_os.default.release().split(".");
    if (Number(osRelease[0]) >= 10 && Number(osRelease[2]) >= 10586) {
      return Number(osRelease[2]) >= 14931 ? 3 : 2;
    }
    return 1;
  }
  if ("CI" in env) {
    if (["GITHUB_ACTIONS", "GITEA_ACTIONS", "CIRCLECI"].some((key) => key in env)) {
      return 3;
    }
    if (["TRAVIS", "APPVEYOR", "GITLAB_CI", "BUILDKITE", "DRONE"].some((sign) => sign in env) || env.CI_NAME === "codeship") {
      return 1;
    }
    return min;
  }
  if ("TEAMCITY_VERSION" in env) {
    return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(env.TEAMCITY_VERSION) ? 1 : 0;
  }
  if (env.COLORTERM === "truecolor") {
    return 3;
  }
  if (env.TERM === "xterm-kitty") {
    return 3;
  }
  if (env.TERM === "xterm-ghostty") {
    return 3;
  }
  if (env.TERM === "wezterm") {
    return 3;
  }
  if ("TERM_PROGRAM" in env) {
    const version = Number.parseInt((env.TERM_PROGRAM_VERSION || "").split(".")[0], 10);
    switch (env.TERM_PROGRAM) {
      case "iTerm.app": {
        return version >= 3 ? 3 : 2;
      }
      case "Apple_Terminal": {
        return 2;
      }
    }
  }
  if (/-256(color)?$/i.test(env.TERM)) {
    return 2;
  }
  if (/^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(env.TERM)) {
    return 1;
  }
  if ("COLORTERM" in env) {
    return 1;
  }
  return min;
}
function createSupportsColor(stream, options = {}) {
  const level = _supportsColor(stream, {
    streamIsTTY: stream && stream.isTTY,
    ...options
  });
  return translateLevel(level);
}
var import_node_process2, import_node_os, import_node_tty, env, flagForceColor, supportsColor, supports_color_default;
var init_supports_color = __esm({
  "node_modules/chalk/source/vendor/supports-color/index.js"() {
    import_node_process2 = __toESM(require("node:process"), 1);
    import_node_os = __toESM(require("node:os"), 1);
    import_node_tty = __toESM(require("node:tty"), 1);
    ({ env } = import_node_process2.default);
    if (hasFlag("no-color") || hasFlag("no-colors") || hasFlag("color=false") || hasFlag("color=never")) {
      flagForceColor = 0;
    } else if (hasFlag("color") || hasFlag("colors") || hasFlag("color=true") || hasFlag("color=always")) {
      flagForceColor = 1;
    }
    supportsColor = {
      stdout: createSupportsColor({ isTTY: import_node_tty.default.isatty(1) }),
      stderr: createSupportsColor({ isTTY: import_node_tty.default.isatty(2) })
    };
    supports_color_default = supportsColor;
  }
});

// node_modules/chalk/source/utilities.js
function stringReplaceAll(string, substring, replacer) {
  let index = string.indexOf(substring);
  if (index === -1) {
    return string;
  }
  const substringLength = substring.length;
  let endIndex = 0;
  let returnValue = "";
  do {
    returnValue += string.slice(endIndex, index) + substring + replacer;
    endIndex = index + substringLength;
    index = string.indexOf(substring, endIndex);
  } while (index !== -1);
  returnValue += string.slice(endIndex);
  return returnValue;
}
function stringEncaseCRLFWithFirstIndex(string, prefix, postfix, index) {
  let endIndex = 0;
  let returnValue = "";
  do {
    const gotCR = string[index - 1] === "\r";
    returnValue += string.slice(endIndex, gotCR ? index - 1 : index) + prefix + (gotCR ? "\r\n" : "\n") + postfix;
    endIndex = index + 1;
    index = string.indexOf("\n", endIndex);
  } while (index !== -1);
  returnValue += string.slice(endIndex);
  return returnValue;
}
var init_utilities = __esm({
  "node_modules/chalk/source/utilities.js"() {
  }
});

// node_modules/chalk/source/index.js
function createChalk(options) {
  return chalkFactory(options);
}
var stdoutColor, stderrColor, GENERATOR, STYLER, IS_EMPTY, levelMapping, styles2, applyOptions, chalkFactory, getModelAnsi, usedModels, proto, createStyler, createBuilder, applyStyle, chalk, chalkStderr, source_default;
var init_source = __esm({
  "node_modules/chalk/source/index.js"() {
    init_ansi_styles();
    init_supports_color();
    init_utilities();
    ({ stdout: stdoutColor, stderr: stderrColor } = supports_color_default);
    GENERATOR = /* @__PURE__ */ Symbol("GENERATOR");
    STYLER = /* @__PURE__ */ Symbol("STYLER");
    IS_EMPTY = /* @__PURE__ */ Symbol("IS_EMPTY");
    levelMapping = [
      "ansi",
      "ansi",
      "ansi256",
      "ansi16m"
    ];
    styles2 = /* @__PURE__ */ Object.create(null);
    applyOptions = (object, options = {}) => {
      if (options.level && !(Number.isInteger(options.level) && options.level >= 0 && options.level <= 3)) {
        throw new Error("The `level` option should be an integer from 0 to 3");
      }
      const colorLevel = stdoutColor ? stdoutColor.level : 0;
      object.level = options.level === void 0 ? colorLevel : options.level;
    };
    chalkFactory = (options) => {
      const chalk2 = (...strings) => strings.join(" ");
      applyOptions(chalk2, options);
      Object.setPrototypeOf(chalk2, createChalk.prototype);
      return chalk2;
    };
    Object.setPrototypeOf(createChalk.prototype, Function.prototype);
    for (const [styleName, style] of Object.entries(ansi_styles_default)) {
      styles2[styleName] = {
        get() {
          const builder = createBuilder(this, createStyler(style.open, style.close, this[STYLER]), this[IS_EMPTY]);
          Object.defineProperty(this, styleName, { value: builder });
          return builder;
        }
      };
    }
    styles2.visible = {
      get() {
        const builder = createBuilder(this, this[STYLER], true);
        Object.defineProperty(this, "visible", { value: builder });
        return builder;
      }
    };
    getModelAnsi = (model, level, type, ...arguments_) => {
      if (model === "rgb") {
        if (level === "ansi16m") {
          return ansi_styles_default[type].ansi16m(...arguments_);
        }
        if (level === "ansi256") {
          return ansi_styles_default[type].ansi256(ansi_styles_default.rgbToAnsi256(...arguments_));
        }
        return ansi_styles_default[type].ansi(ansi_styles_default.rgbToAnsi(...arguments_));
      }
      if (model === "hex") {
        return getModelAnsi("rgb", level, type, ...ansi_styles_default.hexToRgb(...arguments_));
      }
      return ansi_styles_default[type][model](...arguments_);
    };
    usedModels = ["rgb", "hex", "ansi256"];
    for (const model of usedModels) {
      styles2[model] = {
        get() {
          const { level } = this;
          return function(...arguments_) {
            const styler = createStyler(getModelAnsi(model, levelMapping[level], "color", ...arguments_), ansi_styles_default.color.close, this[STYLER]);
            return createBuilder(this, styler, this[IS_EMPTY]);
          };
        }
      };
      const bgModel = "bg" + model[0].toUpperCase() + model.slice(1);
      styles2[bgModel] = {
        get() {
          const { level } = this;
          return function(...arguments_) {
            const styler = createStyler(getModelAnsi(model, levelMapping[level], "bgColor", ...arguments_), ansi_styles_default.bgColor.close, this[STYLER]);
            return createBuilder(this, styler, this[IS_EMPTY]);
          };
        }
      };
    }
    proto = Object.defineProperties(() => {
    }, {
      ...styles2,
      level: {
        enumerable: true,
        get() {
          return this[GENERATOR].level;
        },
        set(level) {
          this[GENERATOR].level = level;
        }
      }
    });
    createStyler = (open, close, parent) => {
      let openAll;
      let closeAll;
      if (parent === void 0) {
        openAll = open;
        closeAll = close;
      } else {
        openAll = parent.openAll + open;
        closeAll = close + parent.closeAll;
      }
      return {
        open,
        close,
        openAll,
        closeAll,
        parent
      };
    };
    createBuilder = (self, _styler, _isEmpty) => {
      const builder = (...arguments_) => applyStyle(builder, arguments_.length === 1 ? "" + arguments_[0] : arguments_.join(" "));
      Object.setPrototypeOf(builder, proto);
      builder[GENERATOR] = self;
      builder[STYLER] = _styler;
      builder[IS_EMPTY] = _isEmpty;
      return builder;
    };
    applyStyle = (self, string) => {
      if (self.level <= 0 || !string) {
        return self[IS_EMPTY] ? "" : string;
      }
      let styler = self[STYLER];
      if (styler === void 0) {
        return string;
      }
      const { openAll, closeAll } = styler;
      if (string.includes("\x1B")) {
        while (styler !== void 0) {
          string = stringReplaceAll(string, styler.close, styler.open);
          styler = styler.parent;
        }
      }
      const lfIndex = string.indexOf("\n");
      if (lfIndex !== -1) {
        string = stringEncaseCRLFWithFirstIndex(string, closeAll, openAll, lfIndex);
      }
      return openAll + string + closeAll;
    };
    Object.defineProperties(createChalk.prototype, styles2);
    chalk = createChalk();
    chalkStderr = createChalk({ level: stderrColor ? stderrColor.level : 0 });
    source_default = chalk;
  }
});

// src/internal/ui/styles.ts
var successStyle, errorStyle, warningStyle, infoStyle, headerStyle;
var init_styles = __esm({
  "src/internal/ui/styles.ts"() {
    "use strict";
    init_source();
    successStyle = source_default.green.bold;
    errorStyle = source_default.red.bold;
    warningStyle = source_default.yellow;
    infoStyle = source_default.cyan;
    headerStyle = source_default.white.bold;
  }
});

// node_modules/sisteransi/src/index.js
var require_src = __commonJS({
  "node_modules/sisteransi/src/index.js"(exports2, module2) {
    "use strict";
    var ESC = "\x1B";
    var CSI = `${ESC}[`;
    var beep = "\x07";
    var cursor = {
      to(x3, y3) {
        if (!y3) return `${CSI}${x3 + 1}G`;
        return `${CSI}${y3 + 1};${x3 + 1}H`;
      },
      move(x3, y3) {
        let ret = "";
        if (x3 < 0) ret += `${CSI}${-x3}D`;
        else if (x3 > 0) ret += `${CSI}${x3}C`;
        if (y3 < 0) ret += `${CSI}${-y3}A`;
        else if (y3 > 0) ret += `${CSI}${y3}B`;
        return ret;
      },
      up: (count = 1) => `${CSI}${count}A`,
      down: (count = 1) => `${CSI}${count}B`,
      forward: (count = 1) => `${CSI}${count}C`,
      backward: (count = 1) => `${CSI}${count}D`,
      nextLine: (count = 1) => `${CSI}E`.repeat(count),
      prevLine: (count = 1) => `${CSI}F`.repeat(count),
      left: `${CSI}G`,
      hide: `${CSI}?25l`,
      show: `${CSI}?25h`,
      save: `${ESC}7`,
      restore: `${ESC}8`
    };
    var scroll = {
      up: (count = 1) => `${CSI}S`.repeat(count),
      down: (count = 1) => `${CSI}T`.repeat(count)
    };
    var erase = {
      screen: `${CSI}2J`,
      up: (count = 1) => `${CSI}1J`.repeat(count),
      down: (count = 1) => `${CSI}J`.repeat(count),
      line: `${CSI}2K`,
      lineEnd: `${CSI}K`,
      lineStart: `${CSI}1K`,
      lines(count) {
        let clear = "";
        for (let i = 0; i < count; i++)
          clear += this.line + (i < count - 1 ? cursor.up() : "");
        if (count)
          clear += cursor.left;
        return clear;
      }
    };
    module2.exports = { cursor, scroll, erase, beep };
  }
});

// node_modules/picocolors/picocolors.js
var require_picocolors = __commonJS({
  "node_modules/picocolors/picocolors.js"(exports2, module2) {
    var p = process || {};
    var argv = p.argv || [];
    var env2 = p.env || {};
    var isColorSupported = !(!!env2.NO_COLOR || argv.includes("--no-color")) && (!!env2.FORCE_COLOR || argv.includes("--color") || p.platform === "win32" || (p.stdout || {}).isTTY && env2.TERM !== "dumb" || !!env2.CI);
    var formatter = (open, close, replace = open) => (input) => {
      let string = "" + input, index = string.indexOf(close, open.length);
      return ~index ? open + replaceClose(string, close, replace, index) + close : open + string + close;
    };
    var replaceClose = (string, close, replace, index) => {
      let result = "", cursor = 0;
      do {
        result += string.substring(cursor, index) + replace;
        cursor = index + close.length;
        index = string.indexOf(close, cursor);
      } while (~index);
      return result + string.substring(cursor);
    };
    var createColors = (enabled = isColorSupported) => {
      let f3 = enabled ? formatter : () => String;
      return {
        isColorSupported: enabled,
        reset: f3("\x1B[0m", "\x1B[0m"),
        bold: f3("\x1B[1m", "\x1B[22m", "\x1B[22m\x1B[1m"),
        dim: f3("\x1B[2m", "\x1B[22m", "\x1B[22m\x1B[2m"),
        italic: f3("\x1B[3m", "\x1B[23m"),
        underline: f3("\x1B[4m", "\x1B[24m"),
        inverse: f3("\x1B[7m", "\x1B[27m"),
        hidden: f3("\x1B[8m", "\x1B[28m"),
        strikethrough: f3("\x1B[9m", "\x1B[29m"),
        black: f3("\x1B[30m", "\x1B[39m"),
        red: f3("\x1B[31m", "\x1B[39m"),
        green: f3("\x1B[32m", "\x1B[39m"),
        yellow: f3("\x1B[33m", "\x1B[39m"),
        blue: f3("\x1B[34m", "\x1B[39m"),
        magenta: f3("\x1B[35m", "\x1B[39m"),
        cyan: f3("\x1B[36m", "\x1B[39m"),
        white: f3("\x1B[37m", "\x1B[39m"),
        gray: f3("\x1B[90m", "\x1B[39m"),
        bgBlack: f3("\x1B[40m", "\x1B[49m"),
        bgRed: f3("\x1B[41m", "\x1B[49m"),
        bgGreen: f3("\x1B[42m", "\x1B[49m"),
        bgYellow: f3("\x1B[43m", "\x1B[49m"),
        bgBlue: f3("\x1B[44m", "\x1B[49m"),
        bgMagenta: f3("\x1B[45m", "\x1B[49m"),
        bgCyan: f3("\x1B[46m", "\x1B[49m"),
        bgWhite: f3("\x1B[47m", "\x1B[49m"),
        blackBright: f3("\x1B[90m", "\x1B[39m"),
        redBright: f3("\x1B[91m", "\x1B[39m"),
        greenBright: f3("\x1B[92m", "\x1B[39m"),
        yellowBright: f3("\x1B[93m", "\x1B[39m"),
        blueBright: f3("\x1B[94m", "\x1B[39m"),
        magentaBright: f3("\x1B[95m", "\x1B[39m"),
        cyanBright: f3("\x1B[96m", "\x1B[39m"),
        whiteBright: f3("\x1B[97m", "\x1B[39m"),
        bgBlackBright: f3("\x1B[100m", "\x1B[49m"),
        bgRedBright: f3("\x1B[101m", "\x1B[49m"),
        bgGreenBright: f3("\x1B[102m", "\x1B[49m"),
        bgYellowBright: f3("\x1B[103m", "\x1B[49m"),
        bgBlueBright: f3("\x1B[104m", "\x1B[49m"),
        bgMagentaBright: f3("\x1B[105m", "\x1B[49m"),
        bgCyanBright: f3("\x1B[106m", "\x1B[49m"),
        bgWhiteBright: f3("\x1B[107m", "\x1B[49m")
      };
    };
    module2.exports = createColors();
    module2.exports.createColors = createColors;
  }
});

// node_modules/@clack/core/dist/index.mjs
function q({ onlyFirst: e2 = false } = {}) {
  const F = ["[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?(?:\\u0007|\\u001B\\u005C|\\u009C))", "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-nq-uy=><~]))"].join("|");
  return new RegExp(F, e2 ? void 0 : "g");
}
function S(e2) {
  if (typeof e2 != "string") throw new TypeError(`Expected a \`string\`, got \`${typeof e2}\``);
  return e2.replace(J, "");
}
function T(e2) {
  return e2 && e2.__esModule && Object.prototype.hasOwnProperty.call(e2, "default") ? e2.default : e2;
}
function A(e2, u = {}) {
  if (typeof e2 != "string" || e2.length === 0 || (u = { ambiguousIsNarrow: true, ...u }, e2 = S(e2), e2.length === 0)) return 0;
  e2 = e2.replace(uD(), "  ");
  const F = u.ambiguousIsNarrow ? 1 : 2;
  let t = 0;
  for (const s of e2) {
    const C2 = s.codePointAt(0);
    if (C2 <= 31 || C2 >= 127 && C2 <= 159 || C2 >= 768 && C2 <= 879) continue;
    switch (X.eastAsianWidth(s)) {
      case "F":
      case "W":
        t += 2;
        break;
      case "A":
        t += F;
        break;
      default:
        t += 1;
    }
  }
  return t;
}
function tD() {
  const e2 = /* @__PURE__ */ new Map();
  for (const [u, F] of Object.entries(r)) {
    for (const [t, s] of Object.entries(F)) r[t] = { open: `\x1B[${s[0]}m`, close: `\x1B[${s[1]}m` }, F[t] = r[t], e2.set(s[0], s[1]);
    Object.defineProperty(r, u, { value: F, enumerable: false });
  }
  return Object.defineProperty(r, "codes", { value: e2, enumerable: false }), r.color.close = "\x1B[39m", r.bgColor.close = "\x1B[49m", r.color.ansi = M(), r.color.ansi256 = P(), r.color.ansi16m = W(), r.bgColor.ansi = M(d), r.bgColor.ansi256 = P(d), r.bgColor.ansi16m = W(d), Object.defineProperties(r, { rgbToAnsi256: { value: (u, F, t) => u === F && F === t ? u < 8 ? 16 : u > 248 ? 231 : Math.round((u - 8) / 247 * 24) + 232 : 16 + 36 * Math.round(u / 255 * 5) + 6 * Math.round(F / 255 * 5) + Math.round(t / 255 * 5), enumerable: false }, hexToRgb: { value: (u) => {
    const F = /[a-f\d]{6}|[a-f\d]{3}/i.exec(u.toString(16));
    if (!F) return [0, 0, 0];
    let [t] = F;
    t.length === 3 && (t = [...t].map((C2) => C2 + C2).join(""));
    const s = Number.parseInt(t, 16);
    return [s >> 16 & 255, s >> 8 & 255, s & 255];
  }, enumerable: false }, hexToAnsi256: { value: (u) => r.rgbToAnsi256(...r.hexToRgb(u)), enumerable: false }, ansi256ToAnsi: { value: (u) => {
    if (u < 8) return 30 + u;
    if (u < 16) return 90 + (u - 8);
    let F, t, s;
    if (u >= 232) F = ((u - 232) * 10 + 8) / 255, t = F, s = F;
    else {
      u -= 16;
      const i = u % 36;
      F = Math.floor(u / 36) / 5, t = Math.floor(i / 6) / 5, s = i % 6 / 5;
    }
    const C2 = Math.max(F, t, s) * 2;
    if (C2 === 0) return 30;
    let D = 30 + (Math.round(s) << 2 | Math.round(t) << 1 | Math.round(F));
    return C2 === 2 && (D += 60), D;
  }, enumerable: false }, rgbToAnsi: { value: (u, F, t) => r.ansi256ToAnsi(r.rgbToAnsi256(u, F, t)), enumerable: false }, hexToAnsi: { value: (u) => r.ansi256ToAnsi(r.hexToAnsi256(u)), enumerable: false } }), r;
}
function R(e2, u, F) {
  return String(e2).normalize().replace(/\r\n/g, `
`).split(`
`).map((t) => oD(t, u, F)).join(`
`);
}
function hD(e2, u) {
  if (e2 === u) return;
  const F = e2.split(`
`), t = u.split(`
`), s = [];
  for (let C2 = 0; C2 < Math.max(F.length, t.length); C2++) F[C2] !== t[C2] && s.push(C2);
  return s;
}
function lD(e2) {
  return e2 === V;
}
function v(e2, u) {
  e2.isTTY && e2.setRawMode(u);
}
function OD({ input: e2 = import_node_process3.stdin, output: u = import_node_process3.stdout, overwrite: F = true, hideCursor: t = true } = {}) {
  const s = f.createInterface({ input: e2, output: u, prompt: "", tabSize: 1 });
  f.emitKeypressEvents(e2, s), e2.isTTY && e2.setRawMode(true);
  const C2 = (D, { name: i }) => {
    if (String(D) === "") {
      t && u.write(import_sisteransi.cursor.show), process.exit(0);
      return;
    }
    if (!F) return;
    let n = i === "return" ? 0 : -1, E2 = i === "return" ? -1 : 0;
    f.moveCursor(u, n, E2, () => {
      f.clearLine(u, 1, () => {
        e2.once("keypress", C2);
      });
    });
  };
  return t && u.write(import_sisteransi.cursor.hide), e2.once("keypress", C2), () => {
    e2.off("keypress", C2), t && u.write(import_sisteransi.cursor.show), e2.isTTY && !WD && e2.setRawMode(false), s.terminal = false, s.close();
  };
}
var import_sisteransi, import_node_process3, f, import_node_readline, import_node_tty2, import_picocolors, J, j, Q, X, DD, uD, d, M, P, W, r, FD, eD, sD, g, CD, b, O, iD, I, w, N, L, rD, y, ED, oD, nD, aD, a, V, z, xD, x, BD, cD, AD, G, pD, fD, gD, K, vD, mD, dD, Y, bD, wD, yD, Z, $D, kD, _D, H, SD, TD, jD, MD, PD, WD;
var init_dist = __esm({
  "node_modules/@clack/core/dist/index.mjs"() {
    import_sisteransi = __toESM(require_src(), 1);
    import_node_process3 = require("node:process");
    f = __toESM(require("node:readline"), 1);
    import_node_readline = __toESM(require("node:readline"), 1);
    import_node_tty2 = require("node:tty");
    import_picocolors = __toESM(require_picocolors(), 1);
    J = q();
    j = { exports: {} };
    (function(e2) {
      var u = {};
      e2.exports = u, u.eastAsianWidth = function(t) {
        var s = t.charCodeAt(0), C2 = t.length == 2 ? t.charCodeAt(1) : 0, D = s;
        return 55296 <= s && s <= 56319 && 56320 <= C2 && C2 <= 57343 && (s &= 1023, C2 &= 1023, D = s << 10 | C2, D += 65536), D == 12288 || 65281 <= D && D <= 65376 || 65504 <= D && D <= 65510 ? "F" : D == 8361 || 65377 <= D && D <= 65470 || 65474 <= D && D <= 65479 || 65482 <= D && D <= 65487 || 65490 <= D && D <= 65495 || 65498 <= D && D <= 65500 || 65512 <= D && D <= 65518 ? "H" : 4352 <= D && D <= 4447 || 4515 <= D && D <= 4519 || 4602 <= D && D <= 4607 || 9001 <= D && D <= 9002 || 11904 <= D && D <= 11929 || 11931 <= D && D <= 12019 || 12032 <= D && D <= 12245 || 12272 <= D && D <= 12283 || 12289 <= D && D <= 12350 || 12353 <= D && D <= 12438 || 12441 <= D && D <= 12543 || 12549 <= D && D <= 12589 || 12593 <= D && D <= 12686 || 12688 <= D && D <= 12730 || 12736 <= D && D <= 12771 || 12784 <= D && D <= 12830 || 12832 <= D && D <= 12871 || 12880 <= D && D <= 13054 || 13056 <= D && D <= 19903 || 19968 <= D && D <= 42124 || 42128 <= D && D <= 42182 || 43360 <= D && D <= 43388 || 44032 <= D && D <= 55203 || 55216 <= D && D <= 55238 || 55243 <= D && D <= 55291 || 63744 <= D && D <= 64255 || 65040 <= D && D <= 65049 || 65072 <= D && D <= 65106 || 65108 <= D && D <= 65126 || 65128 <= D && D <= 65131 || 110592 <= D && D <= 110593 || 127488 <= D && D <= 127490 || 127504 <= D && D <= 127546 || 127552 <= D && D <= 127560 || 127568 <= D && D <= 127569 || 131072 <= D && D <= 194367 || 177984 <= D && D <= 196605 || 196608 <= D && D <= 262141 ? "W" : 32 <= D && D <= 126 || 162 <= D && D <= 163 || 165 <= D && D <= 166 || D == 172 || D == 175 || 10214 <= D && D <= 10221 || 10629 <= D && D <= 10630 ? "Na" : D == 161 || D == 164 || 167 <= D && D <= 168 || D == 170 || 173 <= D && D <= 174 || 176 <= D && D <= 180 || 182 <= D && D <= 186 || 188 <= D && D <= 191 || D == 198 || D == 208 || 215 <= D && D <= 216 || 222 <= D && D <= 225 || D == 230 || 232 <= D && D <= 234 || 236 <= D && D <= 237 || D == 240 || 242 <= D && D <= 243 || 247 <= D && D <= 250 || D == 252 || D == 254 || D == 257 || D == 273 || D == 275 || D == 283 || 294 <= D && D <= 295 || D == 299 || 305 <= D && D <= 307 || D == 312 || 319 <= D && D <= 322 || D == 324 || 328 <= D && D <= 331 || D == 333 || 338 <= D && D <= 339 || 358 <= D && D <= 359 || D == 363 || D == 462 || D == 464 || D == 466 || D == 468 || D == 470 || D == 472 || D == 474 || D == 476 || D == 593 || D == 609 || D == 708 || D == 711 || 713 <= D && D <= 715 || D == 717 || D == 720 || 728 <= D && D <= 731 || D == 733 || D == 735 || 768 <= D && D <= 879 || 913 <= D && D <= 929 || 931 <= D && D <= 937 || 945 <= D && D <= 961 || 963 <= D && D <= 969 || D == 1025 || 1040 <= D && D <= 1103 || D == 1105 || D == 8208 || 8211 <= D && D <= 8214 || 8216 <= D && D <= 8217 || 8220 <= D && D <= 8221 || 8224 <= D && D <= 8226 || 8228 <= D && D <= 8231 || D == 8240 || 8242 <= D && D <= 8243 || D == 8245 || D == 8251 || D == 8254 || D == 8308 || D == 8319 || 8321 <= D && D <= 8324 || D == 8364 || D == 8451 || D == 8453 || D == 8457 || D == 8467 || D == 8470 || 8481 <= D && D <= 8482 || D == 8486 || D == 8491 || 8531 <= D && D <= 8532 || 8539 <= D && D <= 8542 || 8544 <= D && D <= 8555 || 8560 <= D && D <= 8569 || D == 8585 || 8592 <= D && D <= 8601 || 8632 <= D && D <= 8633 || D == 8658 || D == 8660 || D == 8679 || D == 8704 || 8706 <= D && D <= 8707 || 8711 <= D && D <= 8712 || D == 8715 || D == 8719 || D == 8721 || D == 8725 || D == 8730 || 8733 <= D && D <= 8736 || D == 8739 || D == 8741 || 8743 <= D && D <= 8748 || D == 8750 || 8756 <= D && D <= 8759 || 8764 <= D && D <= 8765 || D == 8776 || D == 8780 || D == 8786 || 8800 <= D && D <= 8801 || 8804 <= D && D <= 8807 || 8810 <= D && D <= 8811 || 8814 <= D && D <= 8815 || 8834 <= D && D <= 8835 || 8838 <= D && D <= 8839 || D == 8853 || D == 8857 || D == 8869 || D == 8895 || D == 8978 || 9312 <= D && D <= 9449 || 9451 <= D && D <= 9547 || 9552 <= D && D <= 9587 || 9600 <= D && D <= 9615 || 9618 <= D && D <= 9621 || 9632 <= D && D <= 9633 || 9635 <= D && D <= 9641 || 9650 <= D && D <= 9651 || 9654 <= D && D <= 9655 || 9660 <= D && D <= 9661 || 9664 <= D && D <= 9665 || 9670 <= D && D <= 9672 || D == 9675 || 9678 <= D && D <= 9681 || 9698 <= D && D <= 9701 || D == 9711 || 9733 <= D && D <= 9734 || D == 9737 || 9742 <= D && D <= 9743 || 9748 <= D && D <= 9749 || D == 9756 || D == 9758 || D == 9792 || D == 9794 || 9824 <= D && D <= 9825 || 9827 <= D && D <= 9829 || 9831 <= D && D <= 9834 || 9836 <= D && D <= 9837 || D == 9839 || 9886 <= D && D <= 9887 || 9918 <= D && D <= 9919 || 9924 <= D && D <= 9933 || 9935 <= D && D <= 9953 || D == 9955 || 9960 <= D && D <= 9983 || D == 10045 || D == 10071 || 10102 <= D && D <= 10111 || 11093 <= D && D <= 11097 || 12872 <= D && D <= 12879 || 57344 <= D && D <= 63743 || 65024 <= D && D <= 65039 || D == 65533 || 127232 <= D && D <= 127242 || 127248 <= D && D <= 127277 || 127280 <= D && D <= 127337 || 127344 <= D && D <= 127386 || 917760 <= D && D <= 917999 || 983040 <= D && D <= 1048573 || 1048576 <= D && D <= 1114109 ? "A" : "N";
      }, u.characterLength = function(t) {
        var s = this.eastAsianWidth(t);
        return s == "F" || s == "W" || s == "A" ? 2 : 1;
      };
      function F(t) {
        return t.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]|[^\uD800-\uDFFF]/g) || [];
      }
      u.length = function(t) {
        for (var s = F(t), C2 = 0, D = 0; D < s.length; D++) C2 = C2 + this.characterLength(s[D]);
        return C2;
      }, u.slice = function(t, s, C2) {
        textLen = u.length(t), s = s || 0, C2 = C2 || 1, s < 0 && (s = textLen + s), C2 < 0 && (C2 = textLen + C2);
        for (var D = "", i = 0, n = F(t), E2 = 0; E2 < n.length; E2++) {
          var h2 = n[E2], o2 = u.length(h2);
          if (i >= s - (o2 == 2 ? 1 : 0)) if (i + o2 <= C2) D += h2;
          else break;
          i += o2;
        }
        return D;
      };
    })(j);
    Q = j.exports;
    X = T(Q);
    DD = function() {
      return /\uD83C\uDFF4\uDB40\uDC67\uDB40\uDC62(?:\uDB40\uDC77\uDB40\uDC6C\uDB40\uDC73|\uDB40\uDC73\uDB40\uDC63\uDB40\uDC74|\uDB40\uDC65\uDB40\uDC6E\uDB40\uDC67)\uDB40\uDC7F|(?:\uD83E\uDDD1\uD83C\uDFFF\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFF\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69]))(?:\uD83C[\uDFFB-\uDFFE])|(?:\uD83E\uDDD1\uD83C\uDFFE\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFE\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69]))(?:\uD83C[\uDFFB-\uDFFD\uDFFF])|(?:\uD83E\uDDD1\uD83C\uDFFD\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFD\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69]))(?:\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])|(?:\uD83E\uDDD1\uD83C\uDFFC\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFC\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69]))(?:\uD83C[\uDFFB\uDFFD-\uDFFF])|(?:\uD83E\uDDD1\uD83C\uDFFB\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFB\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69]))(?:\uD83C[\uDFFC-\uDFFF])|\uD83D\uDC68(?:\uD83C\uDFFB(?:\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFF])|\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFF]))|\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFC-\uDFFF])|[\u2695\u2696\u2708]\uFE0F|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD]))?|(?:\uD83C[\uDFFC-\uDFFF])\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFF])|\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFF]))|\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83D\uDC68|(?:\uD83D[\uDC68\uDC69])\u200D(?:\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67]))|\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFF\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFE])|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFE\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFD\uDFFF])|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFD\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFC\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB\uDFFD-\uDFFF])|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|(?:\uD83C\uDFFF\u200D[\u2695\u2696\u2708]|\uD83C\uDFFE\u200D[\u2695\u2696\u2708]|\uD83C\uDFFD\u200D[\u2695\u2696\u2708]|\uD83C\uDFFC\u200D[\u2695\u2696\u2708]|\u200D[\u2695\u2696\u2708])\uFE0F|\u200D(?:(?:\uD83D[\uDC68\uDC69])\u200D(?:\uD83D[\uDC66\uDC67])|\uD83D[\uDC66\uDC67])|\uD83C\uDFFF|\uD83C\uDFFE|\uD83C\uDFFD|\uD83C\uDFFC)?|(?:\uD83D\uDC69(?:\uD83C\uDFFB\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D(?:\uD83D[\uDC68\uDC69])|\uD83D[\uDC68\uDC69])|(?:\uD83C[\uDFFC-\uDFFF])\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D(?:\uD83D[\uDC68\uDC69])|\uD83D[\uDC68\uDC69]))|\uD83E\uDDD1(?:\uD83C[\uDFFB-\uDFFF])\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1)(?:\uD83C[\uDFFB-\uDFFF])|\uD83D\uDC69\u200D\uD83D\uDC69\u200D(?:\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67]))|\uD83D\uDC69(?:\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D(?:\uD83D[\uDC68\uDC69])|\uD83D[\uDC68\uDC69])|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFF\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFE\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFD\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFC\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFB\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD]))|\uD83E\uDDD1(?:\u200D(?:\uD83E\uDD1D\u200D\uD83E\uDDD1|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFF\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFE\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFD\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFC\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFB\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD]))|\uD83D\uDC69\u200D\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC69\u200D\uD83D\uDC69\u200D(?:\uD83D[\uDC66\uDC67])|\uD83D\uDC69\u200D\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|(?:\uD83D\uDC41\uFE0F\u200D\uD83D\uDDE8|\uD83E\uDDD1(?:\uD83C\uDFFF\u200D[\u2695\u2696\u2708]|\uD83C\uDFFE\u200D[\u2695\u2696\u2708]|\uD83C\uDFFD\u200D[\u2695\u2696\u2708]|\uD83C\uDFFC\u200D[\u2695\u2696\u2708]|\uD83C\uDFFB\u200D[\u2695\u2696\u2708]|\u200D[\u2695\u2696\u2708])|\uD83D\uDC69(?:\uD83C\uDFFF\u200D[\u2695\u2696\u2708]|\uD83C\uDFFE\u200D[\u2695\u2696\u2708]|\uD83C\uDFFD\u200D[\u2695\u2696\u2708]|\uD83C\uDFFC\u200D[\u2695\u2696\u2708]|\uD83C\uDFFB\u200D[\u2695\u2696\u2708]|\u200D[\u2695\u2696\u2708])|\uD83D\uDE36\u200D\uD83C\uDF2B|\uD83C\uDFF3\uFE0F\u200D\u26A7|\uD83D\uDC3B\u200D\u2744|(?:(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC70\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD35\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD4\uDDD6-\uDDDD])(?:\uD83C[\uDFFB-\uDFFF])|\uD83D\uDC6F|\uD83E[\uDD3C\uDDDE\uDDDF])\u200D[\u2640\u2642]|(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)(?:\uFE0F|\uD83C[\uDFFB-\uDFFF])\u200D[\u2640\u2642]|\uD83C\uDFF4\u200D\u2620|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC70\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD35\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD4\uDDD6-\uDDDD])\u200D[\u2640\u2642]|[\xA9\xAE\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9\u21AA\u2328\u23CF\u23ED-\u23EF\u23F1\u23F2\u23F8-\u23FA\u24C2\u25AA\u25AB\u25B6\u25C0\u25FB\u25FC\u2600-\u2604\u260E\u2611\u2618\u2620\u2622\u2623\u2626\u262A\u262E\u262F\u2638-\u263A\u2640\u2642\u265F\u2660\u2663\u2665\u2666\u2668\u267B\u267E\u2692\u2694-\u2697\u2699\u269B\u269C\u26A0\u26A7\u26B0\u26B1\u26C8\u26CF\u26D1\u26D3\u26E9\u26F0\u26F1\u26F4\u26F7\u26F8\u2702\u2708\u2709\u270F\u2712\u2714\u2716\u271D\u2721\u2733\u2734\u2744\u2747\u2763\u27A1\u2934\u2935\u2B05-\u2B07\u3030\u303D\u3297\u3299]|\uD83C[\uDD70\uDD71\uDD7E\uDD7F\uDE02\uDE37\uDF21\uDF24-\uDF2C\uDF36\uDF7D\uDF96\uDF97\uDF99-\uDF9B\uDF9E\uDF9F\uDFCD\uDFCE\uDFD4-\uDFDF\uDFF5\uDFF7]|\uD83D[\uDC3F\uDCFD\uDD49\uDD4A\uDD6F\uDD70\uDD73\uDD76-\uDD79\uDD87\uDD8A-\uDD8D\uDDA5\uDDA8\uDDB1\uDDB2\uDDBC\uDDC2-\uDDC4\uDDD1-\uDDD3\uDDDC-\uDDDE\uDDE1\uDDE3\uDDE8\uDDEF\uDDF3\uDDFA\uDECB\uDECD-\uDECF\uDEE0-\uDEE5\uDEE9\uDEF0\uDEF3])\uFE0F|\uD83C\uDFF3\uFE0F\u200D\uD83C\uDF08|\uD83D\uDC69\u200D\uD83D\uDC67|\uD83D\uDC69\u200D\uD83D\uDC66|\uD83D\uDE35\u200D\uD83D\uDCAB|\uD83D\uDE2E\u200D\uD83D\uDCA8|\uD83D\uDC15\u200D\uD83E\uDDBA|\uD83E\uDDD1(?:\uD83C\uDFFF|\uD83C\uDFFE|\uD83C\uDFFD|\uD83C\uDFFC|\uD83C\uDFFB)?|\uD83D\uDC69(?:\uD83C\uDFFF|\uD83C\uDFFE|\uD83C\uDFFD|\uD83C\uDFFC|\uD83C\uDFFB)?|\uD83C\uDDFD\uD83C\uDDF0|\uD83C\uDDF6\uD83C\uDDE6|\uD83C\uDDF4\uD83C\uDDF2|\uD83D\uDC08\u200D\u2B1B|\u2764\uFE0F\u200D(?:\uD83D\uDD25|\uD83E\uDE79)|\uD83D\uDC41\uFE0F|\uD83C\uDFF3\uFE0F|\uD83C\uDDFF(?:\uD83C[\uDDE6\uDDF2\uDDFC])|\uD83C\uDDFE(?:\uD83C[\uDDEA\uDDF9])|\uD83C\uDDFC(?:\uD83C[\uDDEB\uDDF8])|\uD83C\uDDFB(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDEE\uDDF3\uDDFA])|\uD83C\uDDFA(?:\uD83C[\uDDE6\uDDEC\uDDF2\uDDF3\uDDF8\uDDFE\uDDFF])|\uD83C\uDDF9(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDED\uDDEF-\uDDF4\uDDF7\uDDF9\uDDFB\uDDFC\uDDFF])|\uD83C\uDDF8(?:\uD83C[\uDDE6-\uDDEA\uDDEC-\uDDF4\uDDF7-\uDDF9\uDDFB\uDDFD-\uDDFF])|\uD83C\uDDF7(?:\uD83C[\uDDEA\uDDF4\uDDF8\uDDFA\uDDFC])|\uD83C\uDDF5(?:\uD83C[\uDDE6\uDDEA-\uDDED\uDDF0-\uDDF3\uDDF7-\uDDF9\uDDFC\uDDFE])|\uD83C\uDDF3(?:\uD83C[\uDDE6\uDDE8\uDDEA-\uDDEC\uDDEE\uDDF1\uDDF4\uDDF5\uDDF7\uDDFA\uDDFF])|\uD83C\uDDF2(?:\uD83C[\uDDE6\uDDE8-\uDDED\uDDF0-\uDDFF])|\uD83C\uDDF1(?:\uD83C[\uDDE6-\uDDE8\uDDEE\uDDF0\uDDF7-\uDDFB\uDDFE])|\uD83C\uDDF0(?:\uD83C[\uDDEA\uDDEC-\uDDEE\uDDF2\uDDF3\uDDF5\uDDF7\uDDFC\uDDFE\uDDFF])|\uD83C\uDDEF(?:\uD83C[\uDDEA\uDDF2\uDDF4\uDDF5])|\uD83C\uDDEE(?:\uD83C[\uDDE8-\uDDEA\uDDF1-\uDDF4\uDDF6-\uDDF9])|\uD83C\uDDED(?:\uD83C[\uDDF0\uDDF2\uDDF3\uDDF7\uDDF9\uDDFA])|\uD83C\uDDEC(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEE\uDDF1-\uDDF3\uDDF5-\uDDFA\uDDFC\uDDFE])|\uD83C\uDDEB(?:\uD83C[\uDDEE-\uDDF0\uDDF2\uDDF4\uDDF7])|\uD83C\uDDEA(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDED\uDDF7-\uDDFA])|\uD83C\uDDE9(?:\uD83C[\uDDEA\uDDEC\uDDEF\uDDF0\uDDF2\uDDF4\uDDFF])|\uD83C\uDDE8(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDEE\uDDF0-\uDDF5\uDDF7\uDDFA-\uDDFF])|\uD83C\uDDE7(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEF\uDDF1-\uDDF4\uDDF6-\uDDF9\uDDFB\uDDFC\uDDFE\uDDFF])|\uD83C\uDDE6(?:\uD83C[\uDDE8-\uDDEC\uDDEE\uDDF1\uDDF2\uDDF4\uDDF6-\uDDFA\uDDFC\uDDFD\uDDFF])|[#\*0-9]\uFE0F\u20E3|\u2764\uFE0F|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC70\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD35\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD4\uDDD6-\uDDDD])(?:\uD83C[\uDFFB-\uDFFF])|(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)(?:\uFE0F|\uD83C[\uDFFB-\uDFFF])|\uD83C\uDFF4|(?:[\u270A\u270B]|\uD83C[\uDF85\uDFC2\uDFC7]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66\uDC67\uDC6B-\uDC6D\uDC72\uDC74-\uDC76\uDC78\uDC7C\uDC83\uDC85\uDC8F\uDC91\uDCAA\uDD7A\uDD95\uDD96\uDE4C\uDE4F\uDEC0\uDECC]|\uD83E[\uDD0C\uDD0F\uDD18-\uDD1C\uDD1E\uDD1F\uDD30-\uDD34\uDD36\uDD77\uDDB5\uDDB6\uDDBB\uDDD2\uDDD3\uDDD5])(?:\uD83C[\uDFFB-\uDFFF])|(?:[\u261D\u270C\u270D]|\uD83D[\uDD74\uDD90])(?:\uFE0F|\uD83C[\uDFFB-\uDFFF])|[\u270A\u270B]|\uD83C[\uDF85\uDFC2\uDFC7]|\uD83D[\uDC08\uDC15\uDC3B\uDC42\uDC43\uDC46-\uDC50\uDC66\uDC67\uDC6B-\uDC6D\uDC72\uDC74-\uDC76\uDC78\uDC7C\uDC83\uDC85\uDC8F\uDC91\uDCAA\uDD7A\uDD95\uDD96\uDE2E\uDE35\uDE36\uDE4C\uDE4F\uDEC0\uDECC]|\uD83E[\uDD0C\uDD0F\uDD18-\uDD1C\uDD1E\uDD1F\uDD30-\uDD34\uDD36\uDD77\uDDB5\uDDB6\uDDBB\uDDD2\uDDD3\uDDD5]|\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC70\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD35\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD4\uDDD6-\uDDDD]|\uD83D\uDC6F|\uD83E[\uDD3C\uDDDE\uDDDF]|[\u231A\u231B\u23E9-\u23EC\u23F0\u23F3\u25FD\u25FE\u2614\u2615\u2648-\u2653\u267F\u2693\u26A1\u26AA\u26AB\u26BD\u26BE\u26C4\u26C5\u26CE\u26D4\u26EA\u26F2\u26F3\u26F5\u26FA\u26FD\u2705\u2728\u274C\u274E\u2753-\u2755\u2757\u2795-\u2797\u27B0\u27BF\u2B1B\u2B1C\u2B50\u2B55]|\uD83C[\uDC04\uDCCF\uDD8E\uDD91-\uDD9A\uDE01\uDE1A\uDE2F\uDE32-\uDE36\uDE38-\uDE3A\uDE50\uDE51\uDF00-\uDF20\uDF2D-\uDF35\uDF37-\uDF7C\uDF7E-\uDF84\uDF86-\uDF93\uDFA0-\uDFC1\uDFC5\uDFC6\uDFC8\uDFC9\uDFCF-\uDFD3\uDFE0-\uDFF0\uDFF8-\uDFFF]|\uD83D[\uDC00-\uDC07\uDC09-\uDC14\uDC16-\uDC3A\uDC3C-\uDC3E\uDC40\uDC44\uDC45\uDC51-\uDC65\uDC6A\uDC79-\uDC7B\uDC7D-\uDC80\uDC84\uDC88-\uDC8E\uDC90\uDC92-\uDCA9\uDCAB-\uDCFC\uDCFF-\uDD3D\uDD4B-\uDD4E\uDD50-\uDD67\uDDA4\uDDFB-\uDE2D\uDE2F-\uDE34\uDE37-\uDE44\uDE48-\uDE4A\uDE80-\uDEA2\uDEA4-\uDEB3\uDEB7-\uDEBF\uDEC1-\uDEC5\uDED0-\uDED2\uDED5-\uDED7\uDEEB\uDEEC\uDEF4-\uDEFC\uDFE0-\uDFEB]|\uD83E[\uDD0D\uDD0E\uDD10-\uDD17\uDD1D\uDD20-\uDD25\uDD27-\uDD2F\uDD3A\uDD3F-\uDD45\uDD47-\uDD76\uDD78\uDD7A-\uDDB4\uDDB7\uDDBA\uDDBC-\uDDCB\uDDD0\uDDE0-\uDDFF\uDE70-\uDE74\uDE78-\uDE7A\uDE80-\uDE86\uDE90-\uDEA8\uDEB0-\uDEB6\uDEC0-\uDEC2\uDED0-\uDED6]|(?:[\u231A\u231B\u23E9-\u23EC\u23F0\u23F3\u25FD\u25FE\u2614\u2615\u2648-\u2653\u267F\u2693\u26A1\u26AA\u26AB\u26BD\u26BE\u26C4\u26C5\u26CE\u26D4\u26EA\u26F2\u26F3\u26F5\u26FA\u26FD\u2705\u270A\u270B\u2728\u274C\u274E\u2753-\u2755\u2757\u2795-\u2797\u27B0\u27BF\u2B1B\u2B1C\u2B50\u2B55]|\uD83C[\uDC04\uDCCF\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE1A\uDE2F\uDE32-\uDE36\uDE38-\uDE3A\uDE50\uDE51\uDF00-\uDF20\uDF2D-\uDF35\uDF37-\uDF7C\uDF7E-\uDF93\uDFA0-\uDFCA\uDFCF-\uDFD3\uDFE0-\uDFF0\uDFF4\uDFF8-\uDFFF]|\uD83D[\uDC00-\uDC3E\uDC40\uDC42-\uDCFC\uDCFF-\uDD3D\uDD4B-\uDD4E\uDD50-\uDD67\uDD7A\uDD95\uDD96\uDDA4\uDDFB-\uDE4F\uDE80-\uDEC5\uDECC\uDED0-\uDED2\uDED5-\uDED7\uDEEB\uDEEC\uDEF4-\uDEFC\uDFE0-\uDFEB]|\uD83E[\uDD0C-\uDD3A\uDD3C-\uDD45\uDD47-\uDD78\uDD7A-\uDDCB\uDDCD-\uDDFF\uDE70-\uDE74\uDE78-\uDE7A\uDE80-\uDE86\uDE90-\uDEA8\uDEB0-\uDEB6\uDEC0-\uDEC2\uDED0-\uDED6])|(?:[#\*0-9\xA9\xAE\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9\u21AA\u231A\u231B\u2328\u23CF\u23E9-\u23F3\u23F8-\u23FA\u24C2\u25AA\u25AB\u25B6\u25C0\u25FB-\u25FE\u2600-\u2604\u260E\u2611\u2614\u2615\u2618\u261D\u2620\u2622\u2623\u2626\u262A\u262E\u262F\u2638-\u263A\u2640\u2642\u2648-\u2653\u265F\u2660\u2663\u2665\u2666\u2668\u267B\u267E\u267F\u2692-\u2697\u2699\u269B\u269C\u26A0\u26A1\u26A7\u26AA\u26AB\u26B0\u26B1\u26BD\u26BE\u26C4\u26C5\u26C8\u26CE\u26CF\u26D1\u26D3\u26D4\u26E9\u26EA\u26F0-\u26F5\u26F7-\u26FA\u26FD\u2702\u2705\u2708-\u270D\u270F\u2712\u2714\u2716\u271D\u2721\u2728\u2733\u2734\u2744\u2747\u274C\u274E\u2753-\u2755\u2757\u2763\u2764\u2795-\u2797\u27A1\u27B0\u27BF\u2934\u2935\u2B05-\u2B07\u2B1B\u2B1C\u2B50\u2B55\u3030\u303D\u3297\u3299]|\uD83C[\uDC04\uDCCF\uDD70\uDD71\uDD7E\uDD7F\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE02\uDE1A\uDE2F\uDE32-\uDE3A\uDE50\uDE51\uDF00-\uDF21\uDF24-\uDF93\uDF96\uDF97\uDF99-\uDF9B\uDF9E-\uDFF0\uDFF3-\uDFF5\uDFF7-\uDFFF]|\uD83D[\uDC00-\uDCFD\uDCFF-\uDD3D\uDD49-\uDD4E\uDD50-\uDD67\uDD6F\uDD70\uDD73-\uDD7A\uDD87\uDD8A-\uDD8D\uDD90\uDD95\uDD96\uDDA4\uDDA5\uDDA8\uDDB1\uDDB2\uDDBC\uDDC2-\uDDC4\uDDD1-\uDDD3\uDDDC-\uDDDE\uDDE1\uDDE3\uDDE8\uDDEF\uDDF3\uDDFA-\uDE4F\uDE80-\uDEC5\uDECB-\uDED2\uDED5-\uDED7\uDEE0-\uDEE5\uDEE9\uDEEB\uDEEC\uDEF0\uDEF3-\uDEFC\uDFE0-\uDFEB]|\uD83E[\uDD0C-\uDD3A\uDD3C-\uDD45\uDD47-\uDD78\uDD7A-\uDDCB\uDDCD-\uDDFF\uDE70-\uDE74\uDE78-\uDE7A\uDE80-\uDE86\uDE90-\uDEA8\uDEB0-\uDEB6\uDEC0-\uDEC2\uDED0-\uDED6])\uFE0F|(?:[\u261D\u26F9\u270A-\u270D]|\uD83C[\uDF85\uDFC2-\uDFC4\uDFC7\uDFCA-\uDFCC]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66-\uDC78\uDC7C\uDC81-\uDC83\uDC85-\uDC87\uDC8F\uDC91\uDCAA\uDD74\uDD75\uDD7A\uDD90\uDD95\uDD96\uDE45-\uDE47\uDE4B-\uDE4F\uDEA3\uDEB4-\uDEB6\uDEC0\uDECC]|\uD83E[\uDD0C\uDD0F\uDD18-\uDD1F\uDD26\uDD30-\uDD39\uDD3C-\uDD3E\uDD77\uDDB5\uDDB6\uDDB8\uDDB9\uDDBB\uDDCD-\uDDCF\uDDD1-\uDDDD])/g;
    };
    uD = T(DD);
    d = 10;
    M = (e2 = 0) => (u) => `\x1B[${u + e2}m`;
    P = (e2 = 0) => (u) => `\x1B[${38 + e2};5;${u}m`;
    W = (e2 = 0) => (u, F, t) => `\x1B[${38 + e2};2;${u};${F};${t}m`;
    r = { modifier: { reset: [0, 0], bold: [1, 22], dim: [2, 22], italic: [3, 23], underline: [4, 24], overline: [53, 55], inverse: [7, 27], hidden: [8, 28], strikethrough: [9, 29] }, color: { black: [30, 39], red: [31, 39], green: [32, 39], yellow: [33, 39], blue: [34, 39], magenta: [35, 39], cyan: [36, 39], white: [37, 39], blackBright: [90, 39], gray: [90, 39], grey: [90, 39], redBright: [91, 39], greenBright: [92, 39], yellowBright: [93, 39], blueBright: [94, 39], magentaBright: [95, 39], cyanBright: [96, 39], whiteBright: [97, 39] }, bgColor: { bgBlack: [40, 49], bgRed: [41, 49], bgGreen: [42, 49], bgYellow: [43, 49], bgBlue: [44, 49], bgMagenta: [45, 49], bgCyan: [46, 49], bgWhite: [47, 49], bgBlackBright: [100, 49], bgGray: [100, 49], bgGrey: [100, 49], bgRedBright: [101, 49], bgGreenBright: [102, 49], bgYellowBright: [103, 49], bgBlueBright: [104, 49], bgMagentaBright: [105, 49], bgCyanBright: [106, 49], bgWhiteBright: [107, 49] } };
    Object.keys(r.modifier);
    FD = Object.keys(r.color);
    eD = Object.keys(r.bgColor);
    [...FD, ...eD];
    sD = tD();
    g = /* @__PURE__ */ new Set(["\x1B", "\x9B"]);
    CD = 39;
    b = "\x07";
    O = "[";
    iD = "]";
    I = "m";
    w = `${iD}8;;`;
    N = (e2) => `${g.values().next().value}${O}${e2}${I}`;
    L = (e2) => `${g.values().next().value}${w}${e2}${b}`;
    rD = (e2) => e2.split(" ").map((u) => A(u));
    y = (e2, u, F) => {
      const t = [...u];
      let s = false, C2 = false, D = A(S(e2[e2.length - 1]));
      for (const [i, n] of t.entries()) {
        const E2 = A(n);
        if (D + E2 <= F ? e2[e2.length - 1] += n : (e2.push(n), D = 0), g.has(n) && (s = true, C2 = t.slice(i + 1).join("").startsWith(w)), s) {
          C2 ? n === b && (s = false, C2 = false) : n === I && (s = false);
          continue;
        }
        D += E2, D === F && i < t.length - 1 && (e2.push(""), D = 0);
      }
      !D && e2[e2.length - 1].length > 0 && e2.length > 1 && (e2[e2.length - 2] += e2.pop());
    };
    ED = (e2) => {
      const u = e2.split(" ");
      let F = u.length;
      for (; F > 0 && !(A(u[F - 1]) > 0); ) F--;
      return F === u.length ? e2 : u.slice(0, F).join(" ") + u.slice(F).join("");
    };
    oD = (e2, u, F = {}) => {
      if (F.trim !== false && e2.trim() === "") return "";
      let t = "", s, C2;
      const D = rD(e2);
      let i = [""];
      for (const [E2, h2] of e2.split(" ").entries()) {
        F.trim !== false && (i[i.length - 1] = i[i.length - 1].trimStart());
        let o2 = A(i[i.length - 1]);
        if (E2 !== 0 && (o2 >= u && (F.wordWrap === false || F.trim === false) && (i.push(""), o2 = 0), (o2 > 0 || F.trim === false) && (i[i.length - 1] += " ", o2++)), F.hard && D[E2] > u) {
          const B2 = u - o2, p = 1 + Math.floor((D[E2] - B2 - 1) / u);
          Math.floor((D[E2] - 1) / u) < p && i.push(""), y(i, h2, u);
          continue;
        }
        if (o2 + D[E2] > u && o2 > 0 && D[E2] > 0) {
          if (F.wordWrap === false && o2 < u) {
            y(i, h2, u);
            continue;
          }
          i.push("");
        }
        if (o2 + D[E2] > u && F.wordWrap === false) {
          y(i, h2, u);
          continue;
        }
        i[i.length - 1] += h2;
      }
      F.trim !== false && (i = i.map((E2) => ED(E2)));
      const n = [...i.join(`
`)];
      for (const [E2, h2] of n.entries()) {
        if (t += h2, g.has(h2)) {
          const { groups: B2 } = new RegExp(`(?:\\${O}(?<code>\\d+)m|\\${w}(?<uri>.*)${b})`).exec(n.slice(E2).join("")) || { groups: {} };
          if (B2.code !== void 0) {
            const p = Number.parseFloat(B2.code);
            s = p === CD ? void 0 : p;
          } else B2.uri !== void 0 && (C2 = B2.uri.length === 0 ? void 0 : B2.uri);
        }
        const o2 = sD.codes.get(Number(s));
        n[E2 + 1] === `
` ? (C2 && (t += L("")), s && o2 && (t += N(o2))) : h2 === `
` && (s && o2 && (t += N(s)), C2 && (t += L(C2)));
      }
      return t;
    };
    nD = Object.defineProperty;
    aD = (e2, u, F) => u in e2 ? nD(e2, u, { enumerable: true, configurable: true, writable: true, value: F }) : e2[u] = F;
    a = (e2, u, F) => (aD(e2, typeof u != "symbol" ? u + "" : u, F), F);
    V = /* @__PURE__ */ Symbol("clack:cancel");
    z = /* @__PURE__ */ new Map([["k", "up"], ["j", "down"], ["h", "left"], ["l", "right"]]);
    xD = /* @__PURE__ */ new Set(["up", "down", "left", "right", "space", "enter"]);
    x = class {
      constructor({ render: u, input: F = import_node_process3.stdin, output: t = import_node_process3.stdout, ...s }, C2 = true) {
        a(this, "input"), a(this, "output"), a(this, "rl"), a(this, "opts"), a(this, "_track", false), a(this, "_render"), a(this, "_cursor", 0), a(this, "state", "initial"), a(this, "value"), a(this, "error", ""), a(this, "subscribers", /* @__PURE__ */ new Map()), a(this, "_prevFrame", ""), this.opts = s, this.onKeypress = this.onKeypress.bind(this), this.close = this.close.bind(this), this.render = this.render.bind(this), this._render = u.bind(this), this._track = C2, this.input = F, this.output = t;
      }
      prompt() {
        const u = new import_node_tty2.WriteStream(0);
        return u._write = (F, t, s) => {
          this._track && (this.value = this.rl.line.replace(/\t/g, ""), this._cursor = this.rl.cursor, this.emit("value", this.value)), s();
        }, this.input.pipe(u), this.rl = import_node_readline.default.createInterface({ input: this.input, output: u, tabSize: 2, prompt: "", escapeCodeTimeout: 50 }), import_node_readline.default.emitKeypressEvents(this.input, this.rl), this.rl.prompt(), this.opts.initialValue !== void 0 && this._track && this.rl.write(this.opts.initialValue), this.input.on("keypress", this.onKeypress), v(this.input, true), this.output.on("resize", this.render), this.render(), new Promise((F, t) => {
          this.once("submit", () => {
            this.output.write(import_sisteransi.cursor.show), this.output.off("resize", this.render), v(this.input, false), F(this.value);
          }), this.once("cancel", () => {
            this.output.write(import_sisteransi.cursor.show), this.output.off("resize", this.render), v(this.input, false), F(V);
          });
        });
      }
      on(u, F) {
        const t = this.subscribers.get(u) ?? [];
        t.push({ cb: F }), this.subscribers.set(u, t);
      }
      once(u, F) {
        const t = this.subscribers.get(u) ?? [];
        t.push({ cb: F, once: true }), this.subscribers.set(u, t);
      }
      emit(u, ...F) {
        const t = this.subscribers.get(u) ?? [], s = [];
        for (const C2 of t) C2.cb(...F), C2.once && s.push(() => t.splice(t.indexOf(C2), 1));
        for (const C2 of s) C2();
      }
      unsubscribe() {
        this.subscribers.clear();
      }
      onKeypress(u, F) {
        if (this.state === "error" && (this.state = "active"), F?.name && !this._track && z.has(F.name) && this.emit("cursor", z.get(F.name)), F?.name && xD.has(F.name) && this.emit("cursor", F.name), u && (u.toLowerCase() === "y" || u.toLowerCase() === "n") && this.emit("confirm", u.toLowerCase() === "y"), u === "	" && this.opts.placeholder && (this.value || (this.rl.write(this.opts.placeholder), this.emit("value", this.opts.placeholder))), u && this.emit("key", u.toLowerCase()), F?.name === "return") {
          if (this.opts.validate) {
            const t = this.opts.validate(this.value);
            t && (this.error = t, this.state = "error", this.rl.write(this.value));
          }
          this.state !== "error" && (this.state = "submit");
        }
        u === "" && (this.state = "cancel"), (this.state === "submit" || this.state === "cancel") && this.emit("finalize"), this.render(), (this.state === "submit" || this.state === "cancel") && this.close();
      }
      close() {
        this.input.unpipe(), this.input.removeListener("keypress", this.onKeypress), this.output.write(`
`), v(this.input, false), this.rl.close(), this.emit(`${this.state}`, this.value), this.unsubscribe();
      }
      restoreCursor() {
        const u = R(this._prevFrame, process.stdout.columns, { hard: true }).split(`
`).length - 1;
        this.output.write(import_sisteransi.cursor.move(-999, u * -1));
      }
      render() {
        const u = R(this._render(this) ?? "", process.stdout.columns, { hard: true });
        if (u !== this._prevFrame) {
          if (this.state === "initial") this.output.write(import_sisteransi.cursor.hide);
          else {
            const F = hD(this._prevFrame, u);
            if (this.restoreCursor(), F && F?.length === 1) {
              const t = F[0];
              this.output.write(import_sisteransi.cursor.move(0, t)), this.output.write(import_sisteransi.erase.lines(1));
              const s = u.split(`
`);
              this.output.write(s[t]), this._prevFrame = u, this.output.write(import_sisteransi.cursor.move(0, s.length - t - 1));
              return;
            } else if (F && F?.length > 1) {
              const t = F[0];
              this.output.write(import_sisteransi.cursor.move(0, t)), this.output.write(import_sisteransi.erase.down());
              const s = u.split(`
`).slice(t);
              this.output.write(s.join(`
`)), this._prevFrame = u;
              return;
            }
            this.output.write(import_sisteransi.erase.down());
          }
          this.output.write(u), this.state === "initial" && (this.state = "active"), this._prevFrame = u;
        }
      }
    };
    BD = class extends x {
      get cursor() {
        return this.value ? 0 : 1;
      }
      get _value() {
        return this.cursor === 0;
      }
      constructor(u) {
        super(u, false), this.value = !!u.initialValue, this.on("value", () => {
          this.value = this._value;
        }), this.on("confirm", (F) => {
          this.output.write(import_sisteransi.cursor.move(0, -1)), this.value = F, this.state = "submit", this.close();
        }), this.on("cursor", () => {
          this.value = !this.value;
        });
      }
    };
    cD = Object.defineProperty;
    AD = (e2, u, F) => u in e2 ? cD(e2, u, { enumerable: true, configurable: true, writable: true, value: F }) : e2[u] = F;
    G = (e2, u, F) => (AD(e2, typeof u != "symbol" ? u + "" : u, F), F);
    pD = class extends x {
      constructor(u) {
        super(u, false), G(this, "options"), G(this, "cursor", 0);
        const { options: F } = u;
        this.options = Object.entries(F).flatMap(([t, s]) => [{ value: t, group: true, label: t }, ...s.map((C2) => ({ ...C2, group: t }))]), this.value = [...u.initialValues ?? []], this.cursor = Math.max(this.options.findIndex(({ value: t }) => t === u.cursorAt), 0), this.on("cursor", (t) => {
          switch (t) {
            case "left":
            case "up":
              this.cursor = this.cursor === 0 ? this.options.length - 1 : this.cursor - 1;
              break;
            case "down":
            case "right":
              this.cursor = this.cursor === this.options.length - 1 ? 0 : this.cursor + 1;
              break;
            case "space":
              this.toggleValue();
              break;
          }
        });
      }
      getGroupItems(u) {
        return this.options.filter((F) => F.group === u);
      }
      isGroupSelected(u) {
        return this.getGroupItems(u).every((F) => this.value.includes(F.value));
      }
      toggleValue() {
        const u = this.options[this.cursor];
        if (u.group === true) {
          const F = u.value, t = this.getGroupItems(F);
          this.isGroupSelected(F) ? this.value = this.value.filter((s) => t.findIndex((C2) => C2.value === s) === -1) : this.value = [...this.value, ...t.map((s) => s.value)], this.value = Array.from(new Set(this.value));
        } else {
          const F = this.value.includes(u.value);
          this.value = F ? this.value.filter((t) => t !== u.value) : [...this.value, u.value];
        }
      }
    };
    fD = Object.defineProperty;
    gD = (e2, u, F) => u in e2 ? fD(e2, u, { enumerable: true, configurable: true, writable: true, value: F }) : e2[u] = F;
    K = (e2, u, F) => (gD(e2, typeof u != "symbol" ? u + "" : u, F), F);
    vD = class extends x {
      constructor(u) {
        super(u, false), K(this, "options"), K(this, "cursor", 0), this.options = u.options, this.value = [...u.initialValues ?? []], this.cursor = Math.max(this.options.findIndex(({ value: F }) => F === u.cursorAt), 0), this.on("key", (F) => {
          F === "a" && this.toggleAll();
        }), this.on("cursor", (F) => {
          switch (F) {
            case "left":
            case "up":
              this.cursor = this.cursor === 0 ? this.options.length - 1 : this.cursor - 1;
              break;
            case "down":
            case "right":
              this.cursor = this.cursor === this.options.length - 1 ? 0 : this.cursor + 1;
              break;
            case "space":
              this.toggleValue();
              break;
          }
        });
      }
      get _value() {
        return this.options[this.cursor].value;
      }
      toggleAll() {
        const u = this.value.length === this.options.length;
        this.value = u ? [] : this.options.map((F) => F.value);
      }
      toggleValue() {
        const u = this.value.includes(this._value);
        this.value = u ? this.value.filter((F) => F !== this._value) : [...this.value, this._value];
      }
    };
    mD = Object.defineProperty;
    dD = (e2, u, F) => u in e2 ? mD(e2, u, { enumerable: true, configurable: true, writable: true, value: F }) : e2[u] = F;
    Y = (e2, u, F) => (dD(e2, typeof u != "symbol" ? u + "" : u, F), F);
    bD = class extends x {
      constructor({ mask: u, ...F }) {
        super(F), Y(this, "valueWithCursor", ""), Y(this, "_mask", "\u2022"), this._mask = u ?? "\u2022", this.on("finalize", () => {
          this.valueWithCursor = this.masked;
        }), this.on("value", () => {
          if (this.cursor >= this.value.length) this.valueWithCursor = `${this.masked}${import_picocolors.default.inverse(import_picocolors.default.hidden("_"))}`;
          else {
            const t = this.masked.slice(0, this.cursor), s = this.masked.slice(this.cursor);
            this.valueWithCursor = `${t}${import_picocolors.default.inverse(s[0])}${s.slice(1)}`;
          }
        });
      }
      get cursor() {
        return this._cursor;
      }
      get masked() {
        return this.value.replaceAll(/./g, this._mask);
      }
    };
    wD = Object.defineProperty;
    yD = (e2, u, F) => u in e2 ? wD(e2, u, { enumerable: true, configurable: true, writable: true, value: F }) : e2[u] = F;
    Z = (e2, u, F) => (yD(e2, typeof u != "symbol" ? u + "" : u, F), F);
    $D = class extends x {
      constructor(u) {
        super(u, false), Z(this, "options"), Z(this, "cursor", 0), this.options = u.options, this.cursor = this.options.findIndex(({ value: F }) => F === u.initialValue), this.cursor === -1 && (this.cursor = 0), this.changeValue(), this.on("cursor", (F) => {
          switch (F) {
            case "left":
            case "up":
              this.cursor = this.cursor === 0 ? this.options.length - 1 : this.cursor - 1;
              break;
            case "down":
            case "right":
              this.cursor = this.cursor === this.options.length - 1 ? 0 : this.cursor + 1;
              break;
          }
          this.changeValue();
        });
      }
      get _value() {
        return this.options[this.cursor];
      }
      changeValue() {
        this.value = this._value.value;
      }
    };
    kD = Object.defineProperty;
    _D = (e2, u, F) => u in e2 ? kD(e2, u, { enumerable: true, configurable: true, writable: true, value: F }) : e2[u] = F;
    H = (e2, u, F) => (_D(e2, typeof u != "symbol" ? u + "" : u, F), F);
    SD = class extends x {
      constructor(u) {
        super(u, false), H(this, "options"), H(this, "cursor", 0), this.options = u.options;
        const F = this.options.map(({ value: [t] }) => t?.toLowerCase());
        this.cursor = Math.max(F.indexOf(u.initialValue), 0), this.on("key", (t) => {
          if (!F.includes(t)) return;
          const s = this.options.find(({ value: [C2] }) => C2?.toLowerCase() === t);
          s && (this.value = s.value, this.state = "submit", this.emit("submit"));
        });
      }
    };
    TD = Object.defineProperty;
    jD = (e2, u, F) => u in e2 ? TD(e2, u, { enumerable: true, configurable: true, writable: true, value: F }) : e2[u] = F;
    MD = (e2, u, F) => (jD(e2, typeof u != "symbol" ? u + "" : u, F), F);
    PD = class extends x {
      constructor(u) {
        super(u), MD(this, "valueWithCursor", ""), this.on("finalize", () => {
          this.value || (this.value = u.defaultValue), this.valueWithCursor = this.value;
        }), this.on("value", () => {
          if (this.cursor >= this.value.length) this.valueWithCursor = `${this.value}${import_picocolors.default.inverse(import_picocolors.default.hidden("_"))}`;
          else {
            const F = this.value.slice(0, this.cursor), t = this.value.slice(this.cursor);
            this.valueWithCursor = `${F}${import_picocolors.default.inverse(t[0])}${t.slice(1)}`;
          }
        });
      }
      get cursor() {
        return this._cursor;
      }
    };
    WD = globalThis.process.platform.startsWith("win");
  }
});

// node_modules/@clack/prompts/dist/index.mjs
var dist_exports = {};
__export(dist_exports, {
  cancel: () => ue,
  confirm: () => se,
  group: () => he,
  groupMultiselect: () => ce,
  intro: () => oe,
  isCancel: () => lD,
  log: () => f2,
  multiselect: () => ae,
  note: () => le,
  outro: () => $e,
  password: () => re,
  select: () => ie,
  selectKey: () => ne,
  spinner: () => de,
  text: () => te
});
function q2() {
  return import_node_process4.default.platform !== "win32" ? import_node_process4.default.env.TERM !== "linux" : Boolean(import_node_process4.default.env.CI) || Boolean(import_node_process4.default.env.WT_SESSION) || Boolean(import_node_process4.default.env.TERMINUS_SUBLIME) || import_node_process4.default.env.ConEmuTask === "{cmd::Cmder}" || import_node_process4.default.env.TERM_PROGRAM === "Terminus-Sublime" || import_node_process4.default.env.TERM_PROGRAM === "vscode" || import_node_process4.default.env.TERM === "xterm-256color" || import_node_process4.default.env.TERM === "alacritty" || import_node_process4.default.env.TERMINAL_EMULATOR === "JetBrains-JediTerm";
}
function me() {
  const r2 = ["[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)", "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-nq-uy=><~]))"].join("|");
  return new RegExp(r2, "g");
}
var import_node_process4, import_picocolors2, import_sisteransi2, _2, o, H2, I2, x2, S2, K2, a2, d2, b2, E, C, w2, M2, U2, B, Z2, z2, X2, J2, Y2, Q2, ee, y2, te, re, se, ie, ne, ae, ce, R2, le, ue, oe, $e, f2, de, he;
var init_dist2 = __esm({
  "node_modules/@clack/prompts/dist/index.mjs"() {
    init_dist();
    init_dist();
    import_node_process4 = __toESM(require("node:process"), 1);
    import_picocolors2 = __toESM(require_picocolors(), 1);
    import_sisteransi2 = __toESM(require_src(), 1);
    _2 = q2();
    o = (r2, n) => _2 ? r2 : n;
    H2 = o("\u25C6", "*");
    I2 = o("\u25A0", "x");
    x2 = o("\u25B2", "x");
    S2 = o("\u25C7", "o");
    K2 = o("\u250C", "T");
    a2 = o("\u2502", "|");
    d2 = o("\u2514", "\u2014");
    b2 = o("\u25CF", ">");
    E = o("\u25CB", " ");
    C = o("\u25FB", "[\u2022]");
    w2 = o("\u25FC", "[+]");
    M2 = o("\u25FB", "[ ]");
    U2 = o("\u25AA", "\u2022");
    B = o("\u2500", "-");
    Z2 = o("\u256E", "+");
    z2 = o("\u251C", "+");
    X2 = o("\u256F", "+");
    J2 = o("\u25CF", "\u2022");
    Y2 = o("\u25C6", "*");
    Q2 = o("\u25B2", "!");
    ee = o("\u25A0", "x");
    y2 = (r2) => {
      switch (r2) {
        case "initial":
        case "active":
          return import_picocolors2.default.cyan(H2);
        case "cancel":
          return import_picocolors2.default.red(I2);
        case "error":
          return import_picocolors2.default.yellow(x2);
        case "submit":
          return import_picocolors2.default.green(S2);
      }
    };
    te = (r2) => new PD({ validate: r2.validate, placeholder: r2.placeholder, defaultValue: r2.defaultValue, initialValue: r2.initialValue, render() {
      const n = `${import_picocolors2.default.gray(a2)}
${y2(this.state)}  ${r2.message}
`, i = r2.placeholder ? import_picocolors2.default.inverse(r2.placeholder[0]) + import_picocolors2.default.dim(r2.placeholder.slice(1)) : import_picocolors2.default.inverse(import_picocolors2.default.hidden("_")), t = this.value ? this.valueWithCursor : i;
      switch (this.state) {
        case "error":
          return `${n.trim()}
${import_picocolors2.default.yellow(a2)}  ${t}
${import_picocolors2.default.yellow(d2)}  ${import_picocolors2.default.yellow(this.error)}
`;
        case "submit":
          return `${n}${import_picocolors2.default.gray(a2)}  ${import_picocolors2.default.dim(this.value || r2.placeholder)}`;
        case "cancel":
          return `${n}${import_picocolors2.default.gray(a2)}  ${import_picocolors2.default.strikethrough(import_picocolors2.default.dim(this.value ?? ""))}${this.value?.trim() ? `
` + import_picocolors2.default.gray(a2) : ""}`;
        default:
          return `${n}${import_picocolors2.default.cyan(a2)}  ${t}
${import_picocolors2.default.cyan(d2)}
`;
      }
    } }).prompt();
    re = (r2) => new bD({ validate: r2.validate, mask: r2.mask ?? U2, render() {
      const n = `${import_picocolors2.default.gray(a2)}
${y2(this.state)}  ${r2.message}
`, i = this.valueWithCursor, t = this.masked;
      switch (this.state) {
        case "error":
          return `${n.trim()}
${import_picocolors2.default.yellow(a2)}  ${t}
${import_picocolors2.default.yellow(d2)}  ${import_picocolors2.default.yellow(this.error)}
`;
        case "submit":
          return `${n}${import_picocolors2.default.gray(a2)}  ${import_picocolors2.default.dim(t)}`;
        case "cancel":
          return `${n}${import_picocolors2.default.gray(a2)}  ${import_picocolors2.default.strikethrough(import_picocolors2.default.dim(t ?? ""))}${t ? `
` + import_picocolors2.default.gray(a2) : ""}`;
        default:
          return `${n}${import_picocolors2.default.cyan(a2)}  ${i}
${import_picocolors2.default.cyan(d2)}
`;
      }
    } }).prompt();
    se = (r2) => {
      const n = r2.active ?? "Yes", i = r2.inactive ?? "No";
      return new BD({ active: n, inactive: i, initialValue: r2.initialValue ?? true, render() {
        const t = `${import_picocolors2.default.gray(a2)}
${y2(this.state)}  ${r2.message}
`, s = this.value ? n : i;
        switch (this.state) {
          case "submit":
            return `${t}${import_picocolors2.default.gray(a2)}  ${import_picocolors2.default.dim(s)}`;
          case "cancel":
            return `${t}${import_picocolors2.default.gray(a2)}  ${import_picocolors2.default.strikethrough(import_picocolors2.default.dim(s))}
${import_picocolors2.default.gray(a2)}`;
          default:
            return `${t}${import_picocolors2.default.cyan(a2)}  ${this.value ? `${import_picocolors2.default.green(b2)} ${n}` : `${import_picocolors2.default.dim(E)} ${import_picocolors2.default.dim(n)}`} ${import_picocolors2.default.dim("/")} ${this.value ? `${import_picocolors2.default.dim(E)} ${import_picocolors2.default.dim(i)}` : `${import_picocolors2.default.green(b2)} ${i}`}
${import_picocolors2.default.cyan(d2)}
`;
        }
      } }).prompt();
    };
    ie = (r2) => {
      const n = (t, s) => {
        const c2 = t.label ?? String(t.value);
        return s === "active" ? `${import_picocolors2.default.green(b2)} ${c2} ${t.hint ? import_picocolors2.default.dim(`(${t.hint})`) : ""}` : s === "selected" ? `${import_picocolors2.default.dim(c2)}` : s === "cancelled" ? `${import_picocolors2.default.strikethrough(import_picocolors2.default.dim(c2))}` : `${import_picocolors2.default.dim(E)} ${import_picocolors2.default.dim(c2)}`;
      };
      let i = 0;
      return new $D({ options: r2.options, initialValue: r2.initialValue, render() {
        const t = `${import_picocolors2.default.gray(a2)}
${y2(this.state)}  ${r2.message}
`;
        switch (this.state) {
          case "submit":
            return `${t}${import_picocolors2.default.gray(a2)}  ${n(this.options[this.cursor], "selected")}`;
          case "cancel":
            return `${t}${import_picocolors2.default.gray(a2)}  ${n(this.options[this.cursor], "cancelled")}
${import_picocolors2.default.gray(a2)}`;
          default: {
            const s = r2.maxItems === void 0 ? 1 / 0 : Math.max(r2.maxItems, 5);
            this.cursor >= i + s - 3 ? i = Math.max(Math.min(this.cursor - s + 3, this.options.length - s), 0) : this.cursor < i + 2 && (i = Math.max(this.cursor - 2, 0));
            const c2 = s < this.options.length && i > 0, l2 = s < this.options.length && i + s < this.options.length;
            return `${t}${import_picocolors2.default.cyan(a2)}  ${this.options.slice(i, i + s).map((u, m2, $2) => m2 === 0 && c2 ? import_picocolors2.default.dim("...") : m2 === $2.length - 1 && l2 ? import_picocolors2.default.dim("...") : n(u, m2 + i === this.cursor ? "active" : "inactive")).join(`
${import_picocolors2.default.cyan(a2)}  `)}
${import_picocolors2.default.cyan(d2)}
`;
          }
        }
      } }).prompt();
    };
    ne = (r2) => {
      const n = (i, t = "inactive") => {
        const s = i.label ?? String(i.value);
        return t === "selected" ? `${import_picocolors2.default.dim(s)}` : t === "cancelled" ? `${import_picocolors2.default.strikethrough(import_picocolors2.default.dim(s))}` : t === "active" ? `${import_picocolors2.default.bgCyan(import_picocolors2.default.gray(` ${i.value} `))} ${s} ${i.hint ? import_picocolors2.default.dim(`(${i.hint})`) : ""}` : `${import_picocolors2.default.gray(import_picocolors2.default.bgWhite(import_picocolors2.default.inverse(` ${i.value} `)))} ${s} ${i.hint ? import_picocolors2.default.dim(`(${i.hint})`) : ""}`;
      };
      return new SD({ options: r2.options, initialValue: r2.initialValue, render() {
        const i = `${import_picocolors2.default.gray(a2)}
${y2(this.state)}  ${r2.message}
`;
        switch (this.state) {
          case "submit":
            return `${i}${import_picocolors2.default.gray(a2)}  ${n(this.options.find((t) => t.value === this.value), "selected")}`;
          case "cancel":
            return `${i}${import_picocolors2.default.gray(a2)}  ${n(this.options[0], "cancelled")}
${import_picocolors2.default.gray(a2)}`;
          default:
            return `${i}${import_picocolors2.default.cyan(a2)}  ${this.options.map((t, s) => n(t, s === this.cursor ? "active" : "inactive")).join(`
${import_picocolors2.default.cyan(a2)}  `)}
${import_picocolors2.default.cyan(d2)}
`;
        }
      } }).prompt();
    };
    ae = (r2) => {
      const n = (i, t) => {
        const s = i.label ?? String(i.value);
        return t === "active" ? `${import_picocolors2.default.cyan(C)} ${s} ${i.hint ? import_picocolors2.default.dim(`(${i.hint})`) : ""}` : t === "selected" ? `${import_picocolors2.default.green(w2)} ${import_picocolors2.default.dim(s)}` : t === "cancelled" ? `${import_picocolors2.default.strikethrough(import_picocolors2.default.dim(s))}` : t === "active-selected" ? `${import_picocolors2.default.green(w2)} ${s} ${i.hint ? import_picocolors2.default.dim(`(${i.hint})`) : ""}` : t === "submitted" ? `${import_picocolors2.default.dim(s)}` : `${import_picocolors2.default.dim(M2)} ${import_picocolors2.default.dim(s)}`;
      };
      return new vD({ options: r2.options, initialValues: r2.initialValues, required: r2.required ?? true, cursorAt: r2.cursorAt, validate(i) {
        if (this.required && i.length === 0) return `Please select at least one option.
${import_picocolors2.default.reset(import_picocolors2.default.dim(`Press ${import_picocolors2.default.gray(import_picocolors2.default.bgWhite(import_picocolors2.default.inverse(" space ")))} to select, ${import_picocolors2.default.gray(import_picocolors2.default.bgWhite(import_picocolors2.default.inverse(" enter ")))} to submit`))}`;
      }, render() {
        let i = `${import_picocolors2.default.gray(a2)}
${y2(this.state)}  ${r2.message}
`;
        switch (this.state) {
          case "submit":
            return `${i}${import_picocolors2.default.gray(a2)}  ${this.options.filter(({ value: t }) => this.value.includes(t)).map((t) => n(t, "submitted")).join(import_picocolors2.default.dim(", ")) || import_picocolors2.default.dim("none")}`;
          case "cancel": {
            const t = this.options.filter(({ value: s }) => this.value.includes(s)).map((s) => n(s, "cancelled")).join(import_picocolors2.default.dim(", "));
            return `${i}${import_picocolors2.default.gray(a2)}  ${t.trim() ? `${t}
${import_picocolors2.default.gray(a2)}` : ""}`;
          }
          case "error": {
            const t = this.error.split(`
`).map((s, c2) => c2 === 0 ? `${import_picocolors2.default.yellow(d2)}  ${import_picocolors2.default.yellow(s)}` : `   ${s}`).join(`
`);
            return i + import_picocolors2.default.yellow(a2) + "  " + this.options.map((s, c2) => {
              const l2 = this.value.includes(s.value), u = c2 === this.cursor;
              return u && l2 ? n(s, "active-selected") : l2 ? n(s, "selected") : n(s, u ? "active" : "inactive");
            }).join(`
${import_picocolors2.default.yellow(a2)}  `) + `
` + t + `
`;
          }
          default:
            return `${i}${import_picocolors2.default.cyan(a2)}  ${this.options.map((t, s) => {
              const c2 = this.value.includes(t.value), l2 = s === this.cursor;
              return l2 && c2 ? n(t, "active-selected") : c2 ? n(t, "selected") : n(t, l2 ? "active" : "inactive");
            }).join(`
${import_picocolors2.default.cyan(a2)}  `)}
${import_picocolors2.default.cyan(d2)}
`;
        }
      } }).prompt();
    };
    ce = (r2) => {
      const n = (i, t, s = []) => {
        const c2 = i.label ?? String(i.value), l2 = typeof i.group == "string", u = l2 && (s[s.indexOf(i) + 1] ?? { group: true }), m2 = l2 && u.group === true, $2 = l2 ? `${m2 ? d2 : a2} ` : "";
        return t === "active" ? `${import_picocolors2.default.dim($2)}${import_picocolors2.default.cyan(C)} ${c2} ${i.hint ? import_picocolors2.default.dim(`(${i.hint})`) : ""}` : t === "group-active" ? `${$2}${import_picocolors2.default.cyan(C)} ${import_picocolors2.default.dim(c2)}` : t === "group-active-selected" ? `${$2}${import_picocolors2.default.green(w2)} ${import_picocolors2.default.dim(c2)}` : t === "selected" ? `${import_picocolors2.default.dim($2)}${import_picocolors2.default.green(w2)} ${import_picocolors2.default.dim(c2)}` : t === "cancelled" ? `${import_picocolors2.default.strikethrough(import_picocolors2.default.dim(c2))}` : t === "active-selected" ? `${import_picocolors2.default.dim($2)}${import_picocolors2.default.green(w2)} ${c2} ${i.hint ? import_picocolors2.default.dim(`(${i.hint})`) : ""}` : t === "submitted" ? `${import_picocolors2.default.dim(c2)}` : `${import_picocolors2.default.dim($2)}${import_picocolors2.default.dim(M2)} ${import_picocolors2.default.dim(c2)}`;
      };
      return new pD({ options: r2.options, initialValues: r2.initialValues, required: r2.required ?? true, cursorAt: r2.cursorAt, validate(i) {
        if (this.required && i.length === 0) return `Please select at least one option.
${import_picocolors2.default.reset(import_picocolors2.default.dim(`Press ${import_picocolors2.default.gray(import_picocolors2.default.bgWhite(import_picocolors2.default.inverse(" space ")))} to select, ${import_picocolors2.default.gray(import_picocolors2.default.bgWhite(import_picocolors2.default.inverse(" enter ")))} to submit`))}`;
      }, render() {
        let i = `${import_picocolors2.default.gray(a2)}
${y2(this.state)}  ${r2.message}
`;
        switch (this.state) {
          case "submit":
            return `${i}${import_picocolors2.default.gray(a2)}  ${this.options.filter(({ value: t }) => this.value.includes(t)).map((t) => n(t, "submitted")).join(import_picocolors2.default.dim(", "))}`;
          case "cancel": {
            const t = this.options.filter(({ value: s }) => this.value.includes(s)).map((s) => n(s, "cancelled")).join(import_picocolors2.default.dim(", "));
            return `${i}${import_picocolors2.default.gray(a2)}  ${t.trim() ? `${t}
${import_picocolors2.default.gray(a2)}` : ""}`;
          }
          case "error": {
            const t = this.error.split(`
`).map((s, c2) => c2 === 0 ? `${import_picocolors2.default.yellow(d2)}  ${import_picocolors2.default.yellow(s)}` : `   ${s}`).join(`
`);
            return `${i}${import_picocolors2.default.yellow(a2)}  ${this.options.map((s, c2, l2) => {
              const u = this.value.includes(s.value) || s.group === true && this.isGroupSelected(`${s.value}`), m2 = c2 === this.cursor;
              return !m2 && typeof s.group == "string" && this.options[this.cursor].value === s.group ? n(s, u ? "group-active-selected" : "group-active", l2) : m2 && u ? n(s, "active-selected", l2) : u ? n(s, "selected", l2) : n(s, m2 ? "active" : "inactive", l2);
            }).join(`
${import_picocolors2.default.yellow(a2)}  `)}
${t}
`;
          }
          default:
            return `${i}${import_picocolors2.default.cyan(a2)}  ${this.options.map((t, s, c2) => {
              const l2 = this.value.includes(t.value) || t.group === true && this.isGroupSelected(`${t.value}`), u = s === this.cursor;
              return !u && typeof t.group == "string" && this.options[this.cursor].value === t.group ? n(t, l2 ? "group-active-selected" : "group-active", c2) : u && l2 ? n(t, "active-selected", c2) : l2 ? n(t, "selected", c2) : n(t, u ? "active" : "inactive", c2);
            }).join(`
${import_picocolors2.default.cyan(a2)}  `)}
${import_picocolors2.default.cyan(d2)}
`;
        }
      } }).prompt();
    };
    R2 = (r2) => r2.replace(me(), "");
    le = (r2 = "", n = "") => {
      const i = `
${r2}
`.split(`
`), t = R2(n).length, s = Math.max(i.reduce((l2, u) => (u = R2(u), u.length > l2 ? u.length : l2), 0), t) + 2, c2 = i.map((l2) => `${import_picocolors2.default.gray(a2)}  ${import_picocolors2.default.dim(l2)}${" ".repeat(s - R2(l2).length)}${import_picocolors2.default.gray(a2)}`).join(`
`);
      process.stdout.write(`${import_picocolors2.default.gray(a2)}
${import_picocolors2.default.green(S2)}  ${import_picocolors2.default.reset(n)} ${import_picocolors2.default.gray(B.repeat(Math.max(s - t - 1, 1)) + Z2)}
${c2}
${import_picocolors2.default.gray(z2 + B.repeat(s + 2) + X2)}
`);
    };
    ue = (r2 = "") => {
      process.stdout.write(`${import_picocolors2.default.gray(d2)}  ${import_picocolors2.default.red(r2)}

`);
    };
    oe = (r2 = "") => {
      process.stdout.write(`${import_picocolors2.default.gray(K2)}  ${r2}
`);
    };
    $e = (r2 = "") => {
      process.stdout.write(`${import_picocolors2.default.gray(a2)}
${import_picocolors2.default.gray(d2)}  ${r2}

`);
    };
    f2 = { message: (r2 = "", { symbol: n = import_picocolors2.default.gray(a2) } = {}) => {
      const i = [`${import_picocolors2.default.gray(a2)}`];
      if (r2) {
        const [t, ...s] = r2.split(`
`);
        i.push(`${n}  ${t}`, ...s.map((c2) => `${import_picocolors2.default.gray(a2)}  ${c2}`));
      }
      process.stdout.write(`${i.join(`
`)}
`);
    }, info: (r2) => {
      f2.message(r2, { symbol: import_picocolors2.default.blue(J2) });
    }, success: (r2) => {
      f2.message(r2, { symbol: import_picocolors2.default.green(Y2) });
    }, step: (r2) => {
      f2.message(r2, { symbol: import_picocolors2.default.green(S2) });
    }, warn: (r2) => {
      f2.message(r2, { symbol: import_picocolors2.default.yellow(Q2) });
    }, warning: (r2) => {
      f2.warn(r2);
    }, error: (r2) => {
      f2.message(r2, { symbol: import_picocolors2.default.red(ee) });
    } };
    de = () => {
      const r2 = _2 ? ["\u25D2", "\u25D0", "\u25D3", "\u25D1"] : ["\u2022", "o", "O", "0"], n = _2 ? 80 : 120;
      let i, t, s = false, c2 = "";
      const l2 = (v2 = "") => {
        s = true, i = OD(), c2 = v2.replace(/\.+$/, ""), process.stdout.write(`${import_picocolors2.default.gray(a2)}
`);
        let g2 = 0, p = 0;
        t = setInterval(() => {
          const O2 = import_picocolors2.default.magenta(r2[g2]), P2 = ".".repeat(Math.floor(p)).slice(0, 3);
          process.stdout.write(import_sisteransi2.cursor.move(-999, 0)), process.stdout.write(import_sisteransi2.erase.down(1)), process.stdout.write(`${O2}  ${c2}${P2}`), g2 = g2 + 1 < r2.length ? g2 + 1 : 0, p = p < r2.length ? p + 0.125 : 0;
        }, n);
      }, u = (v2 = "", g2 = 0) => {
        c2 = v2 ?? c2, s = false, clearInterval(t);
        const p = g2 === 0 ? import_picocolors2.default.green(S2) : g2 === 1 ? import_picocolors2.default.red(I2) : import_picocolors2.default.red(x2);
        process.stdout.write(import_sisteransi2.cursor.move(-999, 0)), process.stdout.write(import_sisteransi2.erase.down(1)), process.stdout.write(`${p}  ${c2}
`), i();
      }, m2 = (v2 = "") => {
        c2 = v2 ?? c2;
      }, $2 = (v2) => {
        const g2 = v2 > 1 ? "Something went wrong" : "Canceled";
        s && u(g2, v2);
      };
      return process.on("uncaughtExceptionMonitor", () => $2(2)), process.on("unhandledRejection", () => $2(2)), process.on("SIGINT", () => $2(1)), process.on("SIGTERM", () => $2(1)), process.on("exit", $2), { start: l2, stop: u, message: m2 };
    };
    he = async (r2, n) => {
      const i = {}, t = Object.keys(r2);
      for (const s of t) {
        const c2 = r2[s], l2 = await c2({ results: i })?.catch((u) => {
          throw u;
        });
        if (typeof n?.onCancel == "function" && lD(l2)) {
          i[s] = "canceled", n.onCancel({ results: i });
          continue;
        }
        i[s] = l2;
      }
      return i;
    };
  }
});

// src/internal/ui/renderer.ts
function computeColumnWidths(headers, rows) {
  const colWidths = headers.map((h2) => h2.length);
  for (const row of rows) {
    for (let i = 0; i < row.length; i++) {
      if (i < colWidths.length && row[i].length > colWidths[i]) {
        colWidths[i] = row[i].length;
      }
    }
  }
  return colWidths;
}
var CharmUIRenderer;
var init_renderer = __esm({
  "src/internal/ui/renderer.ts"() {
    "use strict";
    init_styles();
    CharmUIRenderer = class {
      renderSuccess(msg) {
        console.log(successStyle(`\u2713 ${msg}`));
      }
      renderError(msg) {
        console.error(errorStyle(`\u2717 ${msg}`));
      }
      renderWarning(msg) {
        console.log(warningStyle(`\u26A0 ${msg}`));
      }
      renderInfo(msg) {
        console.log(infoStyle(msg));
      }
      renderTable(headers, rows) {
        if (headers.length === 0) return;
        const colWidths = computeColumnWidths(headers, rows);
        const headerLine = headers.map((h2, i) => h2.padEnd(colWidths[i])).join("  ");
        const separatorLine = colWidths.map((w3) => "-".repeat(w3)).join("  ");
        console.log(headerStyle(headerLine));
        console.log(separatorLine);
        for (const row of rows) {
          const rowLine = row.map((cell, i) => i < colWidths.length ? cell.padEnd(colWidths[i]) : cell).join("  ");
          console.log(rowLine);
        }
      }
      async confirm(prompt) {
        const { confirm: clackConfirm, isCancel } = await Promise.resolve().then(() => (init_dist2(), dist_exports));
        const result = await clackConfirm({ message: prompt });
        if (isCancel(result)) return false;
        return result;
      }
    };
  }
});

// src/cmd/init.ts
var init_exports = {};
__export(init_exports, {
  createInitCommand: () => createInitCommand,
  runInit: () => runInit,
  selectToolInteractively: () => selectToolInteractively
});
function createInitCommand() {
  const cmd = new Command("init").description("Initialize command template directory for detected AI tool").action(async () => {
    await runInit();
  });
  return cmd;
}
async function runInit() {
  const workingDir = (0, import_node_process5.cwd)();
  if (!detectedResult2.isValid) {
    const tool = await selectToolInteractively();
    if (tool === "unknown" /* Unknown */) {
      uiRenderer.renderError("No tool selected");
      return false;
    }
    Object.assign(detectedResult2, {
      toolType: tool,
      configPath: det.getConfigDirPath(tool, workingDir),
      isValid: true,
      message: `tool manually selected: ${tool}`
    });
  }
  const configPath = detectedResult2.configPath;
  if (!configPath) {
    uiRenderer.renderError("Could not determine config directory");
    return false;
  }
  if ((0, import_node_fs3.existsSync)(configPath)) {
    uiRenderer.renderWarning(`Directory already exists: ${configPath}`);
    const confirmed = await uiRenderer.confirm("Do you want to continue anyway?");
    if (!confirmed) {
      uiRenderer.renderWarning("Initialization cancelled");
      return false;
    }
  }
  (0, import_node_fs3.mkdirSync)(configPath, { recursive: true });
  uiRenderer.renderSuccess(
    `Initialized ${detectedResult2.toolType} command directory at: ${configPath}`
  );
  return true;
}
async function selectToolInteractively() {
  const { select, isCancel } = await Promise.resolve().then(() => (init_dist2(), dist_exports));
  const result = await select({
    message: "Select your AI coding tool:",
    options: [
      { label: "Cursor", value: "cursor" },
      { label: "Claude Code", value: "claude-code" },
      { label: "Antigravity", value: "antigravity" },
      { label: "Trae", value: "trae" }
    ]
  });
  if (isCancel(result)) return "unknown" /* Unknown */;
  return parseToolFlag(result);
}
var import_node_process5, import_node_fs3;
var init_init = __esm({
  "src/cmd/init.ts"() {
    "use strict";
    init_esm();
    import_node_process5 = require("node:process");
    import_node_fs3 = require("node:fs");
    init_root();
    init_types();
  }
});

// src/internal/templates/flat-strategy.ts
function outputSubdir(sourceDir, toolType) {
  if (!sourceDir) return "";
  if (toolType === "antigravity" /* Antigravity */ && sourceDir === "commands") {
    return "workflows";
  }
  return sourceDir;
}
function getBaseDir(configDir, workingDir) {
  if (!configDir) return workingDir;
  const base = configDir.replace(/\/commands$/, "");
  return (0, import_node_path3.join)(workingDir, base);
}
var import_node_path3, FlatMarkdownStrategy;
var init_flat_strategy = __esm({
  "src/internal/templates/flat-strategy.ts"() {
    "use strict";
    import_node_path3 = require("node:path");
    init_types();
    FlatMarkdownStrategy = class {
      constructor(toolKey, manager) {
        this.toolKey = toolKey;
        this.manager = manager;
      }
      toolKey;
      manager;
      generateAll(workingDir, force, outputDir) {
        const tmpls = this.manager.listAvailable(this.toolKey);
        const results = [];
        for (const t of tmpls) {
          results.push(...this.generateOne(workingDir, t, force, outputDir));
        }
        return results;
      }
      generateOne(workingDir, tmpl, force, outputDir) {
        const toolType = this.toolKey;
        const configDir = getConfigDir(toolType);
        const sub = outputSubdir(tmpl.sourceDir, toolType);
        const base = outputDir ?? getBaseDir(configDir, workingDir);
        const targetDir = sub ? (0, import_node_path3.join)(base, sub, tmpl.subpath) : (0, import_node_path3.join)(base, tmpl.subpath);
        const targetPath = (0, import_node_path3.join)(targetDir, `${tmpl.id}${tmpl.ext}`);
        return [
          this.manager.generate({
            templateName: tmpl.name,
            targetPath,
            force
          })
        ];
      }
    };
  }
});

// src/cmd/generate.ts
var generate_exports = {};
__export(generate_exports, {
  createGenerateCommand: () => createGenerateCommand,
  runGenerate: () => runGenerate
});
function createGenerateCommand() {
  const cmd = new Command("generate").aliases(["gen", "g"]).description("Generate all command template files (or a specific one with [template-name])").argument("[template-name]", "Template name to generate").option("-f, --force", "Overwrite existing files").option("-a, --all", "Generate all available templates").option("-o, --output <path>", "Custom output directory (overrides detection)").action(async (templateName, options) => {
    await runGenerate({ templateName, force: options.force, output: options.output });
  });
  return cmd;
}
async function runGenerate(opts = {}) {
  forceFlag = opts.force ?? false;
  outputFlag = opts.output ?? "";
  if (!outputFlag && !toolFlag) {
    const tool = await selectToolInteractively();
    if (tool === "unknown" /* Unknown */) {
      uiRenderer.renderError("No tool selected. Use --output or --tool flag.");
      return;
    }
    const workingDir = (0, import_node_process6.cwd)();
    Object.assign(detectedResult2, {
      toolType: tool,
      configPath: det.getConfigDirPath(tool, workingDir),
      isValid: true,
      message: `tool manually selected: ${tool}`
    });
  }
  const targetDir = determineTargetDir();
  if (!targetDir) {
    uiRenderer.renderError("Could not determine target directory. Use --output or --tool flag.");
    return;
  }
  if (opts.templateName) {
    await generateSingleTemplate(opts.templateName);
    return;
  }
  await generateAllTemplates(targetDir);
}
function determineTargetDir() {
  if (outputFlag) return outputFlag;
  if (detectedResult2.isValid && detectedResult2.configPath) return detectedResult2.configPath;
  return "";
}
async function generateAllTemplates(_targetDir) {
  const workingDir = (0, import_node_process6.cwd)();
  const mgr = templateManager;
  const strategy = new FlatMarkdownStrategy(detectedResult2.toolType, mgr);
  const results = strategy.generateAll(workingDir, forceFlag, outputFlag || void 0);
  if (results.length === 0) {
    uiRenderer.renderWarning("No templates available");
    return;
  }
  let successCount = 0;
  let failCount = 0;
  for (const result of results) {
    if (result.success) {
      successCount++;
      uiRenderer.renderSuccess(`Generated: ${result.filePath}`);
    } else {
      failCount++;
      uiRenderer.renderError(`Failed: ${result.message}`);
    }
  }
  uiRenderer.renderSuccess(`Generation complete: ${formatCount(successCount, "succeeded")}, ${formatCount(failCount, "failed")}`);
}
async function generateSingleTemplate(name) {
  const tmpl = templateManager.getByName(name);
  if (!tmpl) {
    uiRenderer.renderError(`Template not found: ${name}`);
    return;
  }
  await generateOneViaStrategy(tmpl);
}
async function generateOneViaStrategy(tmpl) {
  if (!tmpl) return;
  const workingDir = (0, import_node_process6.cwd)();
  const mgr = templateManager;
  const strategy = new FlatMarkdownStrategy(detectedResult2.toolType, mgr);
  const results = strategy.generateOne(workingDir, tmpl, forceFlag, outputFlag || void 0);
  for (const r2 of results) {
    if (r2.success) {
      uiRenderer.renderSuccess(`Generated: ${r2.filePath}`);
    } else {
      uiRenderer.renderError(r2.message);
    }
  }
}
function formatCount(count, label) {
  if (count === 1) return `1 ${label.slice(0, -1)}`;
  return `${count} ${label}`;
}
var import_node_process6, forceFlag, outputFlag;
var init_generate = __esm({
  "src/cmd/generate.ts"() {
    "use strict";
    init_esm();
    import_node_process6 = require("node:process");
    init_flat_strategy();
    init_root();
    init_init();
    init_types();
    forceFlag = false;
    outputFlag = "";
  }
});

// src/cmd/root.ts
var root_exports = {};
__export(root_exports, {
  createProgram: () => createProgram,
  det: () => det,
  detectedResult: () => detectedResult2,
  templateManager: () => templateManager,
  toolFlag: () => toolFlag,
  uiRenderer: () => uiRenderer
});
function createProgram() {
  program2.name("Conductor").description(
    "Conductor Spec Driven Development"
  ).version("0.1.0", "-v, --version", "Print conductor version and exit").hook("preAction", (thisCommand) => {
    det = new DefaultDetector();
    uiRenderer = new CharmUIRenderer();
    templateManager = new EmbeddedTemplateManager();
    const workingDir = (0, import_node_process7.cwd)();
    const globalOpts = thisCommand.opts();
    toolFlag = globalOpts.tool ?? "";
    if (toolFlag) {
      const toolType = parseToolFlag(toolFlag);
      detectedResult2 = {
        toolType,
        configPath: det.getConfigDirPath(toolType, workingDir),
        isValid: toolType !== "unknown" /* Unknown */,
        message: `tool manually specified: ${toolType}`
      };
    } else {
      detectedResult2 = det.detect(workingDir);
    }
  }).action(async () => {
    const ok = await runInit();
    if (!ok) return;
    await runGenerate();
  });
  program2.option("-t, --tool <tool>", "Manually specify tool type (cursor, claude-code, antigravity)");
  return program2;
}
var import_node_process7, det, uiRenderer, templateManager, detectedResult2, toolFlag, program2;
var init_root = __esm({
  "src/cmd/root.ts"() {
    "use strict";
    init_esm();
    import_node_process7 = require("node:process");
    init_types();
    init_detector();
    init_manager();
    init_renderer();
    init_init();
    init_generate();
    toolFlag = "";
    program2 = new Command();
  }
});

// src/cmd/list.ts
var list_exports = {};
__export(list_exports, {
  createListCommand: () => createListCommand
});
function createListCommand() {
  const cmd = new Command("list").aliases(["ls"]).description("List available command templates").option("-c, --category <category>", "Filter by category").option("-q, --quiet", "Output only template names (for piping)").option("--all", "List all templates across all categories").action((options) => {
    categoryFlag = options.category ?? "";
    quietFlag = options.quiet ?? false;
    listAllFlag = options.all ?? false;
    let tmpls = listAllFlag ? templateManager.listAll() : templateManager.listAvailable(detectedResult2.toolType);
    if (categoryFlag) {
      tmpls = tmpls.filter((t) => t.category === categoryFlag);
    }
    if (tmpls.length === 0) {
      uiRenderer.renderWarning(
        categoryFlag ? `No templates found in category: ${categoryFlag}` : "No templates available"
      );
      return;
    }
    if (quietFlag) {
      for (const t of tmpls) console.log(t.id);
      return;
    }
    const rows = tmpls.map((t) => [t.name, t.category, t.description]);
    uiRenderer.renderTable(["Name", "Category", "Description"], rows);
  });
  return cmd;
}
var categoryFlag, quietFlag, listAllFlag;
var init_list = __esm({
  "src/cmd/list.ts"() {
    "use strict";
    init_esm();
    init_root();
    categoryFlag = "";
    quietFlag = false;
    listAllFlag = false;
  }
});

// src/cmd/uninstall.ts
var uninstall_exports = {};
__export(uninstall_exports, {
  createUninstallCommand: () => createUninstallCommand
});
function createUninstallCommand() {
  const cmd = new Command("uninstall").description("Uninstall conductor CLI").action(async () => {
    const ctx = detectInstallContext();
    const plan = buildUninstallPlan(ctx);
    if (plan.steps.length === 0) {
      uiRenderer.renderWarning("Nothing to uninstall.");
      return;
    }
    uiRenderer.renderWarning(`Uninstall method detected: ${plan.method}`);
    uiRenderer.renderInfo("The following steps will be performed:");
    plan.steps.forEach((step, i) => uiRenderer.renderInfo(`  ${i + 1}. ${step.description}`));
    const confirmed = await uiRenderer.confirm("Do you want to proceed with uninstall?");
    if (!confirmed) {
      uiRenderer.renderWarning("Uninstall cancelled.");
      return;
    }
    for (const step of plan.steps) {
      uiRenderer.renderInfo(`Executing: ${step.description}...`);
      if (step.run()) {
        uiRenderer.renderSuccess(`Completed: ${step.description}`);
      } else {
        uiRenderer.renderError(`Failed: ${step.description}`);
        uiRenderer.renderWarning("Continuing with remaining steps...");
      }
    }
    uiRenderer.renderSuccess("Uninstall completed. You may need to close and reopen your terminal.");
  });
  return cmd;
}
function detectInstallContext() {
  const binaryPath = process.argv[1] || "";
  const resolvedPath = safeResolve(binaryPath);
  const ctx = { method: "unknown", binaryPath, resolvedPath };
  const detected = tryDetectNpm(ctx, binaryPath) || tryDetectGoInstall(ctx, binaryPath) || tryDetectHomebrew(ctx);
  return detected ?? ctx;
}
function safeResolve(path) {
  try {
    return (0, import_node_path4.resolve)(path);
  } catch {
    return path;
  }
}
function tryDetectNpm(ctx, binaryPath) {
  try {
    const npmPrefix = (0, import_node_child_process.execSync)("npm prefix -g", { encoding: "utf-8" }).trim();
    const npmBinPath = (0, import_node_path4.join)(npmPrefix, "node_modules", ".bin", "conductor");
    if ((0, import_node_fs4.existsSync)(npmBinPath) || binaryPath && binaryPath.includes(npmPrefix)) {
      return { ...ctx, method: "npm" };
    }
  } catch {
  }
  return null;
}
function tryDetectGoInstall(ctx, binaryPath) {
  try {
    const goBin = (0, import_node_child_process.execSync)("go env GOPATH 2>nul || echo no-gopath", {
      encoding: "utf-8",
      shell: "cmd.exe"
    }).trim();
    if (goBin && goBin !== "no-gopath") {
      const goBinPath = (0, import_node_path4.join)(goBin, "bin");
      if (binaryPath && binaryPath.includes(goBinPath)) {
        return { ...ctx, method: "go-install", goBinPath };
      }
    }
  } catch {
  }
  return null;
}
function tryDetectHomebrew(ctx) {
  if (process.platform === "win32") return null;
  try {
    (0, import_node_child_process.execSync)(`brew list ${HOMEBREW_FORMULA_NAME} 2>/dev/null`, { stdio: "ignore" });
    return { ...ctx, method: "homebrew" };
  } catch {
    return null;
  }
}
function buildUninstallPlan(ctx) {
  const steps = [
    ...STEP_BUILDERS[ctx.method](ctx),
    {
      action: "remove-config",
      description: "Remove conductor config directory (if any)",
      run: removeConfigDir
    }
  ];
  return { method: ctx.method, steps };
}
function removeConfigDir() {
  try {
    const cfgDir = process.env.APPDATA ? (0, import_node_path4.join)(process.env.APPDATA, "conductor") : (0, import_node_path4.join)(require("node:os").homedir(), ".config", "conductor");
    if ((0, import_node_fs4.existsSync)(cfgDir)) removeDirRecursive(cfgDir);
    return true;
  } catch {
    return false;
  }
}
function removeDirRecursive(dir) {
  if (!(0, import_node_fs4.existsSync)(dir)) return;
  const entries = (0, import_node_fs4.readdirSync)(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = (0, import_node_path4.join)(dir, entry.name);
    if (entry.isDirectory()) {
      removeDirRecursive(fullPath);
    } else {
      (0, import_node_fs4.unlinkSync)(fullPath);
    }
  }
  (0, import_node_fs4.rmdirSync)(dir);
}
function safeExec(command) {
  try {
    (0, import_node_child_process.execSync)(command, { stdio: "inherit" });
    return true;
  } catch {
    return false;
  }
}
function safeUnlink(path) {
  try {
    (0, import_node_fs4.unlinkSync)(path);
    return true;
  } catch {
    return false;
  }
}
function removeBinaryPair(binaryPath) {
  try {
    if ((0, import_node_fs4.existsSync)(binaryPath)) (0, import_node_fs4.unlinkSync)(binaryPath);
    const exePath = binaryPath + ".exe";
    if ((0, import_node_fs4.existsSync)(exePath)) (0, import_node_fs4.unlinkSync)(exePath);
    return true;
  } catch {
    return false;
  }
}
var import_node_child_process, import_node_fs4, import_node_path4, HOMEBREW_FORMULA_NAME, STEP_BUILDERS;
var init_uninstall = __esm({
  "src/cmd/uninstall.ts"() {
    "use strict";
    init_esm();
    import_node_child_process = require("node:child_process");
    import_node_fs4 = require("node:fs");
    import_node_path4 = require("node:path");
    init_root();
    HOMEBREW_FORMULA_NAME = "luansilvadb/tools/conductor";
    STEP_BUILDERS = {
      homebrew: () => [{
        action: "brew-uninstall",
        description: "Uninstall conductor via Homebrew",
        run: () => safeExec(`brew uninstall ${HOMEBREW_FORMULA_NAME}`)
      }],
      "go-install": (ctx) => {
        if (!ctx.goBinPath) return [];
        const binaryPath = (0, import_node_path4.join)(ctx.goBinPath, "conductor");
        return [{
          action: "remove-binary",
          description: `Remove conductor binary from ${ctx.goBinPath}`,
          run: () => removeBinaryPair(binaryPath)
        }];
      },
      npm: () => [{
        action: "npm-uninstall",
        description: "Uninstall conductor global npm package",
        run: () => safeExec("npm uninstall -g conductor")
      }],
      unknown: (ctx) => {
        if (!ctx.resolvedPath || !(0, import_node_fs4.existsSync)(ctx.resolvedPath)) return [];
        return [{
          action: "remove-binary",
          description: `Remove binary at ${ctx.resolvedPath}`,
          run: () => safeUnlink(ctx.resolvedPath)
        }];
      }
    };
  }
});

// src/cmd/pathcheck.ts
var pathcheck_exports = {};
__export(pathcheck_exports, {
  maybePrintPathHint: () => maybePrintPathHint
});
function maybePrintPathHint() {
  if (isOnPath()) return;
  const binDir = guessInstallDir();
  const markerPath = pathHintMarkerPath();
  if (markerPath && (0, import_node_fs5.existsSync)(markerPath)) return;
  printPathInstructions(binDir);
  if (markerPath) {
    (0, import_node_fs5.mkdirSync)((0, import_node_path5.join)(markerPath, ".."), { recursive: true });
    (0, import_node_fs5.writeFileSync)(markerPath, "shown", "utf-8");
  }
}
function isOnPath() {
  try {
    (0, import_node_child_process2.execSync)(`where ${PROGRAM_NAME}`, { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}
function guessInstallDir() {
  try {
    const binPath = process.argv[1];
    if (!binPath) return "<your Node.js bin directory>";
    return (0, import_node_path5.join)(binPath, "..");
  } catch {
    return "<your Node.js bin directory>";
  }
}
function pathHintMarkerPath() {
  const cfgDir = process.env.APPDATA || (process.platform === "darwin" ? (0, import_node_path5.join)((0, import_node_os2.homedir)(), "Library", "Preferences") : (0, import_node_path5.join)((0, import_node_os2.homedir)(), ".config"));
  if (!cfgDir) return "";
  return (0, import_node_path5.join)(cfgDir, "conductor", PATH_HINT_MARKER_NAME);
}
function printPathInstructions(binDir) {
  const w3 = process.stderr;
  writeHeader(w3, binDir);
  if (process.platform === "win32") {
    writeWindowsInstructions(w3, binDir);
  } else {
    writeUnixInstructions(w3, binDir);
  }
  w3.write("\n");
  w3.write(" (This message will not be shown again.)\n");
  w3.write("\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n");
  w3.write("\n");
}
function writeHeader(w3, binDir) {
  w3.write("\n");
  w3.write("\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n");
  w3.write(" conductor is installed but its directory is not on your PATH.\n");
  w3.write("\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n");
  w3.write(` Binary location: ${binDir}
`);
  w3.write("\n");
}
function writeWindowsInstructions(w3, binDir) {
  w3.write(" To make `conductor` available in any terminal:\n");
  w3.write("\n");
  w3.write("   PowerShell (current user, persistent):\n");
  w3.write(`     [Environment]::SetEnvironmentVariable("Path",
`);
  w3.write(`       [Environment]::GetEnvironmentVariable("Path","User") + ";${binDir}",
`);
  w3.write(`       "User")
`);
  w3.write("\n");
  w3.write("   Then open a new terminal window.\n");
}
function writeUnixInstructions(w3, binDir) {
  const shell = process.env.SHELL ? (0, import_node_path5.join)(process.env.SHELL).split("/").pop() || "" : "";
  const rcFile = SHELL_RC_FILES[shell] ?? "~/.profile";
  w3.write(` Append this line to ${rcFile}:

`);
  if (shell === "fish") {
    w3.write(`   set -gx PATH ${binDir} $PATH
`);
  } else {
    w3.write(`   export PATH="${binDir}:$PATH"
`);
  }
  w3.write(`
 Then reload your shell:

   source ${rcFile}
`);
}
var import_node_path5, import_node_os2, import_node_child_process2, import_node_fs5, PROGRAM_NAME, PATH_HINT_MARKER_NAME, SHELL_RC_FILES;
var init_pathcheck = __esm({
  "src/cmd/pathcheck.ts"() {
    "use strict";
    import_node_path5 = require("node:path");
    import_node_os2 = require("node:os");
    import_node_child_process2 = require("node:child_process");
    import_node_fs5 = require("node:fs");
    PROGRAM_NAME = "conductor";
    PATH_HINT_MARKER_NAME = ".path-hint-shown";
    SHELL_RC_FILES = {
      zsh: "~/.zshrc",
      bash: "~/.bashrc",
      fish: "~/.config/fish/config.fish"
    };
  }
});

// src/index.ts
async function main() {
  const { createProgram: createProgram2 } = await Promise.resolve().then(() => (init_root(), root_exports));
  const { createInitCommand: createInitCommand2 } = await Promise.resolve().then(() => (init_init(), init_exports));
  const { createGenerateCommand: createGenerateCommand2 } = await Promise.resolve().then(() => (init_generate(), generate_exports));
  const { createListCommand: createListCommand2 } = await Promise.resolve().then(() => (init_list(), list_exports));
  const { createUninstallCommand: createUninstallCommand2 } = await Promise.resolve().then(() => (init_uninstall(), uninstall_exports));
  const { maybePrintPathHint: maybePrintPathHint2 } = await Promise.resolve().then(() => (init_pathcheck(), pathcheck_exports));
  maybePrintPathHint2();
  const program3 = createProgram2();
  program3.addCommand(createInitCommand2());
  program3.addCommand(createGenerateCommand2());
  program3.addCommand(createListCommand2());
  program3.addCommand(createUninstallCommand2());
  await program3.parseAsync(process.argv);
}
main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
//# sourceMappingURL=index.cjs.map
