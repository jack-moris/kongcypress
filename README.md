# kongcypress
- cypress to automate test kong manager
- Using github Actions to integrate test suites against target servers.

# Quick assignment check:
- visit a public github link (https://github.com/jack-moris/kongcypress/actions)
- Please check the latest Green Result record. it should contain the test result at the bottom.

# design considerations, assumptions, and trade-offs 
- smoke test for two major funcs: service creation and routes setting.
- design more checkpoints: gateway(routes) should work good under different settings, boundary cases(size/length/strings), reg path cases, unique cases,pagination cases, service and routes integrity cases, etc.
- check data persisitence, eg, for an insertion or deletion operation, data should be persistent in DB to prevend from dirty data or data loss.
- to save time, only use chrome browser as frontend e2e testing.
- to save time, record test result using cypress cloud.
