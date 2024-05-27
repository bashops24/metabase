git reset HEAD~1
rm ./backport.sh
git cherry-pick f3ddcb66a700d8104b01c0b605383bcde285be19
echo 'Resolve conflicts and force push this branch'
