"""Nondeploying, attributable runner checks. No dependency installation or image pull."""
import argparse,datetime,json,os,pathlib,platform,subprocess,re
ALLOCATION={'mig-runners-1':64,'mig-runners-2':4}

def proof_directory():
    import pwd
    repository=os.environ.get('GITHUB_REPOSITORY','')
    run=os.environ.get('GITHUB_RUN_ID','');attempt=os.environ.get('GITHUB_RUN_ATTEMPT','')
    if not re.fullmatch(r'[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+',repository) or not run.isdigit() or not attempt.isdigit():
        raise ValueError('explicit output directory or valid workflow provenance required')
    return pathlib.Path(pwd.getpwuid(os.getuid()).pw_dir,'.local/state/runner-pool-proof',repository.replace('/','--'),run+'-'+attempt)
def targets(host='all'):
    if host not in ['all',*ALLOCATION]:raise ValueError('unknown host')
    return [{'name':f'1-{i}' if h=='mig-runners-1' else f'{h}-{i:02d}',
             'label':f'pool-1-{i}' if h=='mig-runners-1' else f'pool-{h}-{i:02d}',
             'group':'Shared' if h=='mig-runners-1' else 'runners-2','host':h}
            for h,count in ALLOCATION.items() if host in ['all',h] for i in range(1,count+1)]
def invoke(args):
    try:
        p=subprocess.run(args,text=True,stdout=subprocess.PIPE,stderr=subprocess.DEVNULL,timeout=15)
        return p.returncode,p.stdout.strip()
    except (OSError,subprocess.TimeoutExpired):return 1,''
def probe(expected,host):
    checks=[]
    def check(name,ok,observed):checks.append({'name':name,'state':'PASS' if ok else 'FAIL','observed':observed})
    check('runner identity',os.environ.get('RUNNER_NAME')==expected,os.environ.get('RUNNER_NAME'))
    check('platform',platform.system()=='Linux' and platform.machine()=='x86_64',platform.system()+'/'+platform.machine())
    allowed={'mig-runners-1':{'universe-runners-1','mig-runners-1'},'mig-runners-2':{'v2202608392039495029','mig-runners-2'}}
    check('physical host',platform.node() in allowed[host],platform.node())
    group=pathlib.Path('/proc/self/cgroup').read_text().strip()
    check('shared resource membership',group.startswith('0::/github.slice/github-runners.slice/'),group)
    boundary=pathlib.Path('/sys/fs/cgroup/github.slice/github-runners.slice')
    total=next(int(l.split()[1])*1024 for l in pathlib.Path('/proc/meminfo').read_text().splitlines() if l.startswith('MemTotal:'))
    quota,period=(boundary/'cpu.max').read_text().split()
    maximum=int((boundary/'memory.max').read_text())
    check('shared CPU boundary',quota!='max' and int(quota)/int(period)<=(os.cpu_count() or 1)*.95,(boundary/'cpu.max').read_text().strip())
    check('shared RAM boundary',maximum<=total*.95,maximum)
    if host=='mig-runners-1':
        high=int((boundary/'memory.high').read_text());tasks=(boundary/'pids.max').read_text().strip()
        check('early pressure and process limits',0<high<maximum and tasks!='max',{'memory_high':high,'pids_max':tasks,'swap_max':(boundary/'memory.swap.max').read_text().strip()})
    filesystem=os.statvfs('/')
    reserve=(filesystem.f_bfree-filesystem.f_bavail)/filesystem.f_blocks
    check('reserved filesystem blocks',reserve>=.05,reserve)
    for name,args,wanted in [('Node.js',['node','--version'],'v24.19.0'),('npm',['npm','--version'],'11.17.0'),('Docker Engine',['docker','version','--format','{{.Server.Version}}'],'29.7.2')]:
        code,value=invoke(args);check(name,code==0 and value==wanted,value)
    check('workspace permissions',os.access(os.getcwd(),os.W_OK),os.getcwd())
    check('temporary directory',os.access(os.environ.get('TMPDIR','/tmp'),os.W_OK),os.environ.get('TMPDIR','/tmp'))
    code,image=invoke(['docker','image','inspect','alpine:3.20','--format','{{.Id}}'])
    if code==0 and image.startswith('sha256:'):
        status,_=invoke(['docker','run','--rm','--pull=never','--network=none','--read-only','--cap-drop=ALL','--pids-limit=32','--memory=32m','--cpus=.25','--user=65534:65534',image,'/bin/true'])
        check('cached container execution',status==0,image)
        status,container=invoke(['docker','run','--detach','--rm','--pull=never','--network=none','--read-only','--cap-drop=ALL','--user=65534:65534',image,'sleep','10'])
        if status==0:
            try:
                if host=='mig-runners-1':
                    path=boundary/f'user@{os.getuid()}.service/app.slice'/container
                    member=(path/'cgroup.procs').read_text().strip()!=''
                    observed=str(path).removeprefix('/sys/fs/cgroup')
                else:
                    code,pid=invoke(['docker','inspect','--format','{{.State.Pid}}',container])
                    observed=pathlib.Path('/proc',pid,'cgroup').read_text().strip()
                    member=observed.startswith('0::/github.slice/github-runners.slice/')
                check('container shared resource membership',member,observed)
            except OSError as error:
                check('container shared resource membership',False,type(error).__name__)
            finally:invoke(['docker','rm','--force',container])
        else:check('container shared resource membership',False,'container did not start')
    else:checks.append({'name':'cached container execution','state':'BLOCKED','observed':'alpine:3.20 not cached; no image pulled'})
    checks.extend([{'name':'Docker Desktop','state':'NOT APPLICABLE','observed':'headless Linux runner'},
                   {'name':'MySQL 8.4.11','state':'NOT APPLICABLE','observed':'Clone CI uses PostgreSQL; MySQL workloads need fixed-image evidence'}])
    return {'state':'PASS' if all(c['state'] in ['PASS','NOT APPLICABLE'] for c in checks) else 'BLOCKED',
            'runner_name':os.environ.get('RUNNER_NAME'),'expected_name':expected,'host':platform.node(),
            'revision':os.environ.get('GITHUB_SHA'),'run_id':os.environ.get('GITHUB_RUN_ID'),
            'attempt':os.environ.get('GITHUB_RUN_ATTEMPT'),'repository':os.environ.get('GITHUB_REPOSITORY'),
            'observed_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'checks':checks}
def coverage(records,host='all'):
    wanted={t['name'] for t in targets(host)};seen={};errors=[]
    for r in records:
        name=r.get('runner_name')
        if any(os.environ.get(env) and str(r.get(field))!=os.environ[env] for env,field in [('GITHUB_REPOSITORY','repository'),('GITHUB_SHA','revision'),('GITHUB_RUN_ID','run_id'),('GITHUB_RUN_ATTEMPT','attempt')]):
            errors.append('proof provenance mismatch');continue
        if name not in wanted or r.get('expected_name')!=name or name in seen:errors.append('unexpected or duplicate runner identity')
        else:seen[name]=r
    missing=sorted(wanted-seen.keys());passed=sum(r.get('state')=='PASS' for r in seen.values())
    return {'state':'PASS' if not missing and not errors and passed==len(wanted) else 'BLOCKED',
            'expected':len(wanted),'distinct':len(seen),'passed':passed,'missing':missing,'errors':errors,
            'scope_verified':not missing and not errors and passed==len(wanted),
            'full_pool_verified':host=='all' and not missing and not errors and passed==68}
def main():
    parser=argparse.ArgumentParser();sub=parser.add_subparsers(dest='command',required=True)
    p=sub.add_parser('matrix');p.add_argument('--host',default='all',choices=['all',*ALLOCATION])
    p=sub.add_parser('probe');p.add_argument('--name',required=True);p.add_argument('--host',required=True,choices=ALLOCATION);p.add_argument('--output')
    p=sub.add_parser('coverage');p.add_argument('directory',nargs='?');p.add_argument('--host',default='all',choices=['all',*ALLOCATION])
    args=parser.parse_args()
    if args.command=='matrix':print(json.dumps({'include':targets(args.host)}));return
    if args.command=='probe':
        result=probe(args.name,args.host);path=pathlib.Path(args.output) if args.output else proof_directory()/('runner-'+args.name+'.json');path.parent.mkdir(parents=True,exist_ok=True,mode=0o700)
        temporary=path.with_suffix('.new');temporary.write_text(json.dumps(result,indent=2));temporary.replace(path)
    else:result=coverage([json.loads(p.read_text()) for p in (pathlib.Path(args.directory) if args.directory else proof_directory()).rglob('runner-*.json')],args.host)
    print(json.dumps(result,indent=2))
    if result['state']!='PASS':raise SystemExit(1)
if __name__=='__main__':main()
