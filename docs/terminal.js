const font = 'ANSI Shadow';

figlet.defaults({ fontPath: 'https://cdn.jsdelivr.net/npm/figlet/fonts' });
figlet.preloadFonts([font], ready);

const formatter = new Intl.ListFormat('en', {
  style: 'long',
  type: 'conjunction',
});

const directories = {
    education: [
        '',
        '<white>education</white>',

        '* <a href="https://www.ece.iastate.edu/">Iowa State University</a> <yellow>- Computer Engineering</yellow> 2023-2027',
        ''
    ],
    projects: [
        '',
        '<white>Open Source Projects</white>',
        [
            ['Arbitrage Tool','https://github.com/marshfalex/ArbitrageTool','sports betting arbitrage tool'],
            ['Simple RayTracing','https://github.com/marshfalex/raytracing256', 'ray tracing in 256 lines'],
            ['Portfolio','https://jcu.bi/sysend', 'this terminal portfolio!'],
        ].map(([name, url, description = '']) => {
            return `* <a href="${url}">${name}</a> &mdash; <white>${description}</white>`;
        }),
        ''
    ].flat(),
    skills: [
        '',
        '<white>languages</white>',
        [
            'Java',
            'Verilog',
            'C',
            'Python',
            'C++',
            'JavaScript'
        ].map(lang => `* <yellow>${lang}</yellow>`),
        '',
        '<white>libraries</white>',
        [
            'JUnit'
        ].map(lib => `* <green>${lib}</green>`),
        '',
        '<white>tools</white>',
        [
            'Questa',
            'Quartus',
            'Git'
        ].map(lib => `* <blue>${lib}</blue>`),
        ''
    ].flat()
};

const dirs = Object.keys(directories);

const root = '~';
let cwd = root;

const user = 'guest';
const server = 'marshfalex.com';

// not every command needs to be binary
// we picked those three that works more like real programs
const files = [
    'credits',
    'record'
];

function prompt() {
    return `<green>${user}@${server}</green>:<blue>${cwd}</blue>$ `;
}

function print_home() {
     term.echo(dirs.map(dir => {
         return `<blue class="directory">${dir}</blue>`;
     }).join('\n'));
     term.echo(files.map(file => {
         return `<green class="command">${file}</green>`;
     }).join('\n'));
}

const commands = {
    help() {
        term.echo(`List of available commands: ${help}`);
    },
    guide() {
        return [
            '',
            '<white>Available Commands:</white>',
            '* <green>help</green> — Displays this help message.',
            '* <green>ls</green> — Lists directories and files in the current location.',
            '* <green>cd <yellow>&lt;directory&gt;</yellow></green> — Changes the current directory. Use <yellow>..</yellow> to go back or <yellow>~</yellow> for home.',
            '* <green>credits</green> — Displays acknowledgments and used libraries.',
            '* <green>echo <yellow>&lt;text&gt;</yellow></green> — Prints the given text to the terminal.',
            '* <green>record <yellow>(start|stop)</yellow></green> — Starts or stops saving command history.',
            '* <green>clear</green> — Clears the terminal screen.',
            '',
            '<white>How to Navigate:</white>',
            '* Use <green>ls</green> to list directories and explore sections like <blue>education</blue>, <blue>projects</blue>, and <blue>skills</blue>.',
            '* Use <green>cd <yellow>&lt;directory&gt;</yellow></green> to switch to a specific section.',
            '* Click on commands or directories to interact directly.',
            ''
        ].join('\n');
    },
    ls(dir = null) {
        if (dir) {
            if (dir.match(/^~\/?$/)) {
                 print_home();
            } else if (dir.startsWith('~/')) {
                const path = dir.substring(2);
                const dirs = path.split('/');
                if (dirs.length > 1) {
                    this.error('Invalid directory');
                } else {
                    const dir = dirs[0];
                    this.echo(directories[dir].join('\n'));
                }
            } else if (cwd === root) {
                if (dir in directories) {
                    this.echo(directories[dir].join('\n'));
                } else {
                    this.error('Invalid directory');
                }
            } else if (dir === '..') {
                print_home();
            } else {
                this.error('Invalid directory');
            }
        } else if (cwd === root) {
           print_home();
        } else {
            const dir = cwd.substring(2);
            this.echo(directories[dir].join('\n'));
        }
    },
    cd(dir = null) {
        if (dir === null || (dir === '..' && cwd !== root)) {
            cwd = root;
        } else if (dir.startsWith('~/') && dirs.includes(dir.substring(2))) {
            cwd = dir;
        } else if (dir.startsWith('../') && cwd !== root && dirs.includes(dir.substring(3))) {
            cwd = root + '/' + dir.substring(3);
        } else if (dirs.includes(dir)) {
            cwd = root + '/' + dir;
        } else {
            this.error('Wrong directory');
        }
    },
    credits() {
        // you can return string or a Promise from a command
        return [
            '',
            '<white>Source and Inspiration:</white>',
            '* <a href="https://codepen.io/jcubic/full/ZEZPWRY">Terminal Portfolio Demo</a>',
            '',
            '<white>Used Libraries:</white>',
            '* <a href="https://terminal.jcubic.pl">jQuery Terminal</a>',
            '* <a href="https://github.com/patorjk/figlet.js/">Figlet.js</a>',
            ''
        ].join('\n');
    },
    echo(...args) {
        if (args.length > 0) {
            term.echo(args.join(' '));
        }
    },
    record(arg) {
        if (arg === 'start') {
            term.history_state(true);
        } else if (arg === 'stop') {
            term.history_state(false);
        } else {
            term.echo('save commands in url hash so you can share the link\n\n' +
                      'usage: record [stop|start]\n');
        }
    }
};

// clear is default command that you can turn off with an option
const command_list = ['clear'].concat(Object.keys(commands));
const formatted_list = command_list.map(cmd => `<white class="command">${cmd}</white>`);
const help = formatter.format(formatted_list);

const re = new RegExp(`^\s*(${command_list.join('|')})(\s?.*)`);

$.terminal.new_formatter([re, function(_, command, args) {
    return `<white class="command">${command}</white><aquamarine>${args}</aquamarine>`;
}]);

const term = $('body').terminal(commands, {
    greetings: false,
    checkArity: false,
    // terminal should be disabled when running in CodePen preview
    enabled: $('body').attr('onload') === undefined,
    completion(string) {
        // in every function we can use this to reference term object
        const { name, rest } = $.terminal.parse_command(this.get_command());
        if (['cd', 'ls'].includes(name)) {
            if (rest.startsWith('~/')) {
                return dirs.map(dir => `~/${dir}`);
            }
            if (rest.startsWith('../') && cwd != root) {
                return dirs.map(dir => `../${dir}`);
            }
            if (cwd === root) {
                return dirs;
            }
        }
        return Object.keys(commands);
    },
    execHash: true,
    prompt
});

if ($.terminal.xml_formatter) {
    $.terminal.xml_formatter.tags.blue = (attrs) => {
        return `[[;#55F;;${attrs.class}]`;
    };
    $.terminal.xml_formatter.tags.green = (attrs) => {
        return `[[;#44D544;;${attrs.class}]`;
    };
} else {
    console.error("$.terminal.xml_formatter is not available.");
}


term.pause();

term.on('click', '.command', function() {
   const command = $(this).text();
   term.exec(command, { typing: true, delay: 50 });
});

term.on('click', '.directory', function() {
    const dir = $(this).text();
    term.exec(`cd ~/${dir}`, { typing: true, delay: 50 });
});

function ready() {
    term.echo(() => render('My Portfolio'), { ansi: true })
        .echo('<white>Welcome to my Portfolio! Enter "guide" to get started</white>\n').resume();
}

function render(text) {
    const cols = term.cols();
    return trim(figlet.textSync(text, {
        font: font,
        width: cols,
        whitespaceBreak: true
    }));
}

function trim(str) {
    return str.replace(/[\n\s]+$/, '');
}

function hex(color) {
    return '#' + [color.red, color.green, color.blue].map(n => {
        return n.toString(16).padStart(2, '0');
    }).join('');
}

github('jcubic/jquery.terminal');