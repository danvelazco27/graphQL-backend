import { requireAuth, type AuthContext } from "../../middleware/auth.js";
import * as userService from "../../services/user.service.js";
import * as contactService from "../../services/contact.service.js";

export const resolvers = {
  Query: {
    me: (_: unknown, __: unknown, context: AuthContext) => {
      const user = requireAuth(context.user);
      return userService.getMe(user.userId);
    },

    contacts: (_: unknown, __: unknown, context: AuthContext) => {
      const user = requireAuth(context.user);
      return contactService.getContacts(user.userId);
    },

    contact: (_: unknown, args: { id: string }, context: AuthContext) => {
      const user = requireAuth(context.user);
      return contactService.getContact(user.userId, args.id);
    },
  },

  Mutation: {
    register: (_: unknown, args: { email: string; password: string }) => {
      return userService.register(args.email, args.password);
    },

    login: (_: unknown, args: { email: string; password: string }) => {
      return userService.login(args.email, args.password);
    },

    createContact: (
      _: unknown,
      args: { name: string; email: string; phone: string },
      context: AuthContext
    ) => {
      const user = requireAuth(context.user);
      return contactService.createContact(user.userId, args);
    },

    updateContact: (
      _: unknown,
      args: { id: string; name?: string; email?: string; phone?: string },
      context: AuthContext
    ) => {
      const user = requireAuth(context.user);
      return contactService.updateContact(user.userId, args.id, {
        name: args.name,
        email: args.email,
        phone: args.phone,
      });
    },

    deleteContact: (_: unknown, args: { id: string }, context: AuthContext) => {
      const user = requireAuth(context.user);
      return contactService.deleteContact(user.userId, args.id);
    },
  },
};
