module.exports = {
  "apps": [
    {
      "name": "TodoApp Backend",
      "script": "./server.js",
      "instances": 'max',
      "exec_mode": "cluster",
      "watch": ["server"],
	  "watch_delay": 1000,
	  "ignore_watch" : ["node_modules"],
	  "watch_options": {
		  "followSymlinks": false
		},
	  "env": {
        "NODE_ENV": "development"
      },
      "env_production": {
        "NODE_ENV": "production"
      },
	  "args": [
        "--color"
      ]
    }
  ]
}
