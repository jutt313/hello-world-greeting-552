
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users, Plus, Mail, Shield, Crown, UserCheck, Settings } from 'lucide-react';

interface TeamPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'member';
  status: 'active' | 'pending' | 'inactive';
  joinedAt: string;
}

const TeamPopup: React.FC<TeamPopupProps> = ({ isOpen, onClose }) => {
  const [inviteEmail, setInviteEmail] = useState('');
  
  // Mock team data - in real app this would come from Supabase
  const [teamMembers] = useState<TeamMember[]>([
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'owner',
      status: 'active',
      joinedAt: '2024-01-15'
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'admin',
      status: 'active',
      joinedAt: '2024-01-20'
    },
    {
      id: '3',
      name: 'Mike Johnson',
      email: 'mike@example.com',
      role: 'member',
      status: 'pending',
      joinedAt: '2024-01-25'
    }
  ]);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Crown className="w-4 h-4" />;
      case 'admin': return <Shield className="w-4 h-4" />;
      case 'member': return <UserCheck className="w-4 h-4" />;
      default: return <UserCheck className="w-4 h-4" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-yellow-500/20 text-yellow-500';
      case 'admin': return 'bg-blue-500/20 text-blue-500';
      case 'member': return 'bg-green-500/20 text-green-500';
      default: return 'bg-gray-500/20 text-gray-500';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-500';
      case 'pending': return 'bg-yellow-500/20 text-yellow-500';
      case 'inactive': return 'bg-gray-500/20 text-gray-500';
      default: return 'bg-gray-500/20 text-gray-500';
    }
  };

  const handleInvite = () => {
    if (!inviteEmail) return;
    // Here you would handle the invitation logic
    console.log('Inviting:', inviteEmail);
    setInviteEmail('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl rounded-xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Users className="w-5 h-5" />
            Team Management
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[70vh] pr-4">
          <div className="space-y-6">
            {/* Team Overview */}
            <section className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-lg p-4 border border-blue-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-blue-400" />
                    <span className="text-sm text-muted-foreground">Total Members</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-400">{teamMembers.length}</p>
                </div>
                
                <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-lg p-4 border border-green-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <UserCheck className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-muted-foreground">Active</span>
                  </div>
                  <p className="text-2xl font-bold text-green-400">
                    {teamMembers.filter(m => m.status === 'active').length}
                  </p>
                </div>
                
                <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-lg p-4 border border-yellow-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm text-muted-foreground">Pending</span>
                  </div>
                  <p className="text-2xl font-bold text-yellow-400">
                    {teamMembers.filter(m => m.status === 'pending').length}
                  </p>
                </div>
              </div>
            </section>

            {/* Invite New Member */}
            <section className="space-y-4">
              <h2 className="text-lg font-semibold">Invite Team Member</h2>
              <div className="flex gap-3">
                <div className="flex-1">
                  <Input
                    placeholder="Enter email address"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
                <Button onClick={handleInvite} disabled={!inviteEmail}>
                  <Plus className="w-4 h-4 mr-2" />
                  Send Invite
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Invited members will receive an email with instructions to join your team.
              </p>
            </section>

            {/* Team Members List */}
            <section className="space-y-4">
              <h2 className="text-lg font-semibold">Team Members</h2>
              <div className="space-y-3">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-400 flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-medium">{member.name}</h3>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                        <p className="text-xs text-muted-foreground">
                          Joined {new Date(member.joinedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Badge className={getRoleBadgeColor(member.role)} variant="secondary">
                        {getRoleIcon(member.role)}
                        <span className="ml-1 capitalize">{member.role}</span>
                      </Badge>
                      
                      <Badge className={getStatusBadgeColor(member.status)} variant="secondary">
                        <span className="capitalize">{member.status}</span>
                      </Badge>
                      
                      {member.role !== 'owner' && (
                        <Button variant="ghost" size="sm">
                          <Settings className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Team Permissions */}
            <section className="space-y-4">
              <h2 className="text-lg font-semibold">Role Permissions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-card border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Crown className="w-4 h-4 text-yellow-500" />
                    <h3 className="font-medium">Owner</h3>
                  </div>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Full access to all features</li>
                    <li>• Manage team members and roles</li>
                    <li>• Billing and subscription management</li>
                    <li>• Delete team and projects</li>
                  </ul>
                </div>
                
                <div className="bg-card border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-4 h-4 text-blue-500" />
                    <h3 className="font-medium">Admin</h3>
                  </div>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Manage projects and agents</li>
                    <li>• Invite and remove members</li>
                    <li>• Configure LLM providers</li>
                    <li>• View all analytics</li>
                  </ul>
                </div>
                
                <div className="bg-card border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <UserCheck className="w-4 h-4 text-green-500" />
                    <h3 className="font-medium">Member</h3>
                  </div>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Access assigned projects</li>
                    <li>• Use AI agents and tools</li>
                    <li>• View own usage analytics</li>
                    <li>• Basic CLI access</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Team Settings */}
            <section className="space-y-4">
              <h2 className="text-lg font-semibold">Team Settings</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Team Name</h3>
                    <p className="text-sm text-muted-foreground">Change your team's display name</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Usage Limits</h3>
                    <p className="text-sm text-muted-foreground">Set token and cost limits per member</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Configure
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Security Policies</h3>
                    <p className="text-sm text-muted-foreground">Configure team security settings</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Manage
                  </Button>
                </div>
              </div>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default TeamPopup;
