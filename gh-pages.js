var ghpages = require('gh-pages');

ghpages.publish(
    'public', // path to public directory
    {
        branch: 'gh-pages',
        repo: 'https://github.com/baripembo/centre-in-numbers.git', // Update to point to your repository  
        user: {
            name: 'baripembo', // update to use your name
            email: 'erikawei@gmail.com' // Update to use your email
        }
    },
    () => {
        console.log('Deploy Complete!')
    }
)