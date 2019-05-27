#!/usr/bin/env node
const {Signale} = require('signale');
const log = new Signale();
const interactive = new Signale({interactive: true});
const path = require('path');
require('yargs')
	.scriptName("aqua")
	.usage('$0 <cmd> [args]')

	.command('compile [paramaters]', 'compiles a system into a cache', (yargs) => {
		yargs.option('cache', {
			type: 'string',
			default: '.cache',
			describe: 'path of the cache'
		})
		yargs.option('index', {
			type: 'string',
			default: 'index.js',
			describe: 'path to the system index'
		})
	}, cliCompile)

	.help()
	.argv;

return;



/// this is the base compile function, that the CLI directly calls.
async function cliCompile(args) {
	console.log('things')
	const {compile} = require('./compiler.js');
	if(!path.isAbsolute(args.index)) args.index = path.join(process.cwd(), 'index.js');
	if(!path.isAbsolute(args.cache)) args.cache = path.join(process.cwd(), 'index.js');


	let index = platformPrecompile(args);
	log.info('precompile completed');
	

	index = compileParameters(index);
	log.info('parameters injected');
	
	
	index = compileLinks(index);
	log.info('entity links created')


	compile({
		index: index,
		cache: args.cache
	})
}


/// Do all platform related things to the index file, like substituting
/// CLI arguments, and converting from a filepath to an actual index object.
// TODO make this also do dependencies
function platformPrecompile(args) {
	// if its a path, require the file and create the object.
	if(typeof args.index === 'string') {
		args.index = require(args.index);
	}

	const index = args.index;

	for(const key in args) {
		if(key in index.Parameters) {
			index.Parameters[key] = args[key];
		}
	}

	return index;
}


function compileParameters (index) {
	let entities = index.Entities;

	for(const key in index.Parameters) {
		entities = recursiveReplace(entities, `\$${key}`, index.Parameters[key]);
	}

	return {
		Entities: entities
	};
}

function compileLinks (index) {
	// TODO implement links

	let entities = index.Entities;

	for(const key in index.Parameters) {
		entities = recursiveReplace(entities, `\$${key}`, index.Parameters[key]);
	}

	return {
		Entities: entities
	};
}


function recursiveReplace(obj, find, replace) {
	switch(typeof obj) {
		case 'string': {
			if(obj === find) return replace;
			else return obj;
		}
		case 'object': {
			if(Array.isArray(obj)) {
				const newArr = [];
				for(const value of obj) {
					newArr.push(recursiveReplace(value, find, replace));
				}
				return newArr;
			} else {
				const newObj = {};
				for (const key in obj) {
					newObj[key] = recursiveReplace(obj[key], find, replace);
				}
				return newObj;
			}
		}
		default: {
			return obj;
		}
	}
}